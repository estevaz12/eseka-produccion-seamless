import { useEffect, useRef, useState } from 'react';
import { useConfig } from '../ConfigContext.jsx';
import DataTable from './DataTable.jsx';
import { Check, Edit } from '@mui/icons-material';
import { Button, FormControl, Input } from '@mui/joy';

let apiUrl;

// TODO - handle articulos incompletos
export default function ProgramadaTable({
  startDate = localStorage.getItem('progStartDate'),
  progColor,
  setProgColor,
  filteredProgColor,
  setFilteredProgColor,
}) {
  apiUrl = useConfig().apiUrl;
  const [machines, setMachines] = useState([]);

  useEffect(() => {
    let ignore = false;
    // fetch and repeat every minute
    function fetchProgColor() {
      if (startDate) {
        const params = new URLSearchParams({
          startDate,
        }).toString();
        fetch(`${apiUrl}/programada?${params}`)
          .then((res) => res.json())
          .then((data) => {
            if (!ignore) {
              setProgColor(data.progColor);
              setMachines(data.machines);
            }
          })
          .catch((err) =>
            console.error('[CLIENT] Error fetching /programada:', err)
          );
      }
    }

    fetchProgColor();
    // update every minute
    const intervalId = setInterval(fetchProgColor, 60000);

    return () => {
      clearInterval(intervalId);
      ignore = true;
    };
  }, [startDate, setProgColor]);

  // If an articulo has a NULL color distr, docenas will be null.
  // This lets the user input the docenas value and update the programada.
  function AProducir({ row, aProducir }) {
    const [editProducir, setEditProducir] = useState(false);
    const [docenas, setDocenas] = useState();
    const inputRef = useRef(null);

    useEffect(() => {
      let timeoutId;
      if (editProducir) {
        timeoutId = setTimeout(() => {
          inputRef.current.focus();
        }, 10);
      }

      return () => clearTimeout(timeoutId);
    }, [editProducir]);

    async function handleProducirEdit(e) {
      e.preventDefault();

      try {
        await fetch(`${apiUrl}/programada/updateDocenas`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            programadaId: row.Programada,
            colorDistrId: row.ColorDistr,
            docenas,
          }),
        });

        // update programada view
        const params = new URLSearchParams({
          startDate,
        }).toString();
        const res = await fetch(`${apiUrl}/programada?${params}`);
        const data = await res.json();

        setProgColor(data.progColor);
        setFilteredProgColor(data.progColor);
        setMachines(data.machines);
        setEditProducir(false);
      } catch (err) {
        console.error(
          '[CLIENT] Error fetching /programada/updateDocenas:',
          err
        );
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        handleProducirEdit(e);
      }
    };

    return !editProducir ? (
      <span>
        {row.Tipo === null ? aProducir : `${aProducir} (${row.Docenas})`}
        {!row.Docenas && row.Docenas !== 0 && (
          <Edit onClick={() => setEditProducir(true)} />
        )}
      </span>
    ) : (
      <form onSubmit={handleProducirEdit}>
        <FormControl>
          <Input
            required
            type='number'
            slotProps={{ input: { ref: inputRef, min: 0 } }}
            onChange={(e) => setDocenas(e.target.value)}
          />
        </FormControl>
        <Button type='submit' onKeyDown={(e) => handleKeyDown(e)}>
          <Check />
        </Button>
      </form>
    );
  }

  function mapRows(row) {
    const aProducir =
      row.Tipo === null
        ? row.Docenas
        : row.Tipo === '#'
        ? row.Docenas * 2
        : row.Docenas / 2;

    const producido =
      row.Tipo === null
        ? (row.Producido / 12 / 1.01).toFixed(1)
        : row.Tipo === '#'
        ? ((row.Producido * 2) / 12 / 1.01).toFixed(1)
        : (row.Producido / 2 / 12 / 1.01).toFixed(1);

    const falta = (aProducir - producido).toFixed(1);
    const faltaFisico = ((row.Target - row.Producido) / 12 / 1.01).toFixed(1);
    const faltaUnidades = row.Target - row.Producido;

    const matchingMachines = machines
      .filter(
        // match machines with articulo
        (m) =>
          m.StyleCode.articulo === Math.floor(row.Articulo) &&
          m.StyleCode.talle === row.Talle &&
          m.StyleCode.colorId === row.ColorId
      )
      .map((m) => `${m.MachCode} (P: ${m.Pieces})`) // display all machines with articulo
      .join(' - ');

    return (
      <tr>
        {/* Articulo */}
        <td>{`${row.Articulo}${row.Tipo ? row.Tipo : ''}`}</td>
        {/* Talle */}
        <td>{row.Talle}</td>
        {/* Color + Porcentaje */}
        <td>{`${row.Color} ${
          row.Porcentaje && row.Porcentaje < 100 ? `(${row.Porcentaje}%)` : ''
        }`}</td>
        {/* Target (un.) */}
        <td>{row.Target}</td>
        {/* A Producir */}
        <td>
          <AProducir row={row} aProducir={aProducir} />
        </td>
        {/* Producido */}
        <td>
          {row.Tipo === null
            ? producido
            : `${producido} (${(row.Producido / 12 / 1.01).toFixed(1)})`}
        </td>
        {/* Falta */}
        <td>{row.Tipo === null ? falta : `${falta} (${faltaFisico})`}</td>
        {/* Falta (un.) */}
        <td>{faltaUnidades}</td>
        {/* Doc. x Talle */}
        <td>{row.DocProg}</td>
        {/* Doc. x Art. */}
        <td>{row.DocPorArt}</td>
        {/* Maquinas */}
        <td>{matchingMachines}</td>
      </tr>
    );
  }

  return (
    <DataTable
      cols={[
        'Artículo', // Articulo + Tipo
        'Talle',
        'Color', // Color + Porcentaje
        'Target (un.)',
        'A Producir', // Docenas
        'Producido', // Produccion Mensual
        'Falta', // A Producir - Producido
        'Falta (un.)',
        'Doc. x Talle', // DocProg
        'Doc. x Art.', // DocPorArt
        'Máquinas',
      ]}
    >
      {startDate && progColor && machines && filteredProgColor.length === 0
        ? progColor.map(mapRows)
        : filteredProgColor.map(mapRows)}
    </DataTable>
  );
}
