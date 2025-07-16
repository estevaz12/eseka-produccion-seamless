import { useEffect, useMemo, useRef, useState } from 'react';
import { useConfig } from '../ConfigContext.jsx';
import DataTable from './DataTable.jsx';
import { Check, Close, Edit } from '@mui/icons-material';
import { Button, Input, Typography } from '@mui/joy';

let apiUrl;

export default function ProgramadaTable({
  startDate,
  progColor,
  setProgColor,
  filteredProgColor,
  setFilteredProgColor,
  live = true,
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

    if (live) {
      fetchProgColor();
      // update every minute
      const intervalId = setInterval(fetchProgColor, 60000);

      return () => {
        clearInterval(intervalId);
        ignore = true;
      };
    }
  }, [startDate, setProgColor, live]);

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
        {
          // if docenas is null, show edit icon, otherwise show docenas
          !row.Docenas && row.Docenas !== 0 ? (
            <Edit onClick={() => setEditProducir(true)} />
          ) : row.Tipo === null ? (
            aProducir
          ) : (
            `${aProducir} (${row.Docenas})`
          )
        }
      </span>
    ) : (
      <form onSubmit={handleProducirEdit} className='grid grid-cols-2 gap-1'>
        <Input
          type='number'
          slotProps={{ input: { ref: inputRef, min: 0 } }}
          onChange={(e) => setDocenas(e.target.value)}
          className='col-span-2'
          required
        />
        <Button color='danger' onClick={() => setEditProducir(false)}>
          <Close />
        </Button>
        <Button type='submit' onKeyDown={(e) => handleKeyDown(e)}>
          <Check />
        </Button>
      </form>
    );
  }

  // Utility functions
  function calcAProducir(row) {
    if (row.Tipo === null) return row.Docenas;
    if (row.Tipo === '#') return row.Docenas * 2;
    return row.Docenas / 2;
  }

  function calcProducido(row) {
    if (row.Tipo === null) return row.Producido / 12 / 1.01;
    if (row.Tipo === '#') return (row.Producido * 2) / 12 / 1.01;
    return row.Producido / 2 / 12 / 1.01;
  }

  function roundUpEven(num) {
    // round up to nearest even number
    num = Math.ceil(num);
    return num % 2 === 0 ? num : num + 1;
  }

  function formatNum(num) {
    if (!num) return num;
    else if (num % 1 < 0.1)
      return num.toFixed(); // No decimals for whole numbers
    else return num.toFixed(1); // One decimal for non-whole numbers
  }

  function mapRows(row, i) {
    const aProducir = formatNum(calcAProducir(row));
    const producido = formatNum(calcProducido(row));
    const falta = formatNum(calcAProducir(row) - calcProducido(row));
    const faltaFisico = formatNum((row.Target - row.Producido) / 12 / 1.01);
    const faltaUnidades = row.Target - row.Producido;

    const matchingMachines = machines.filter(
      // match machines with articulo
      (m) =>
        m.StyleCode.articulo === row.Articulo &&
        m.StyleCode.talle === row.Talle &&
        m.StyleCode.colorId === row.ColorId
    );
    const machinesList = matchingMachines.map((m) => {
      return (
        <Typography
          key={m.MachCode}
        >{`${m.MachCode} (P: ${m.Pieces})`}</Typography>
      );
    }); // display all machines with articulo

    const targetCalc =
      matchingMachines.length <= 1
        ? // if one machine, just add pieces to remaining
          // if no machines, just show remaining
          roundUpEven(
            faltaUnidades +
              (row.Producido === 0 ? 0 : matchingMachines[0]?.Pieces || 0)
          ) // FIXME
        : matchingMachines.map((m) => {
            // if multiple machines, calculate target per machine
            // divide remaining pieces by number of machines
            let machineTarget = roundUpEven(
              (row.Producido === 0 ? 0 : m.Pieces) +
                faltaUnidades / matchingMachines.length
            ); // FIXME

            return (
              <Typography
                key={m.MachCode}
              >{`${m.MachCode} -> ${machineTarget}`}</Typography>
            );
          });

    let rowClassName = 'bg-todo';
    if (!row.Docenas && row.Docenas !== 0)
      rowClassName = ''; // NO TIENE DISTR, FALTA ASIGNAR
    else if (matchingMachines.length > 0)
      rowClassName = 'bg-making'; // TEJIENDO
    else if (faltaUnidades <= 0) rowClassName = 'bg-done'; // LLEGÓ
    else if (matchingMachines.length === 0 && faltaUnidades <= 12)
      rowClassName = 'bg-almost-done'; // CASI LLEGÓ - Menos de una docena
    else if (matchingMachines.length === 0 && faltaUnidades < row.Target)
      rowClassName = 'bg-incomplete'; // INCOMPLETO

    return (
      <tr
        key={i}
        className={`${rowClassName} *:border-dark-accent hover:bg-row-hover`}
      >
        {/* Articulo */}
        <td>{`${row.Articulo}${row.Tipo ? row.Tipo : ''}`}</td>
        {/* Talle */}
        <td>{row.Talle}</td>
        {/* Color + Porcentaje */}
        <td>{`${row.Color} ${
          row.Porcentaje && row.Porcentaje < 100 ? `(${row.Porcentaje}%)` : ''
        }`}</td>
        {/* A Producir */}
        <td>
          <AProducir row={row} aProducir={aProducir} />
        </td>
        {/* Producido */}
        <td>
          {row.Tipo === null
            ? producido
            : `${producido} (${formatNum(row.Producido / 12 / 1.01)})`}
        </td>
        {/* Falta */}
        <td>{row.Tipo == null ? falta : `${falta} (${faltaFisico})`}</td>
        {/* Target (un.) */}
        <td>{faltaUnidades <= 0 ? 'LLEGÓ' : targetCalc}</td>
        {/* Falta (un.) */}
        <td>{faltaUnidades}</td>
        {/* Maquinas */}
        {live && <td>{machinesList}</td>}
      </tr>
    );
  }

  // Memoized totals
  const totalAProducir = useMemo(() => {
    let progToUse =
      filteredProgColor.length > 0 ? filteredProgColor : progColor;
    return progToUse.reduce((acc, row) => acc + calcAProducir(row), 0);
  }, [progColor, filteredProgColor]);
  const totalProducido = useMemo(() => {
    let progToUse =
      filteredProgColor.length > 0 ? filteredProgColor : progColor;
    return progToUse.reduce((acc, row) => acc + calcProducido(row), 0);
  }, [progColor, filteredProgColor]);
  const totalFalta = useMemo(
    () => totalAProducir - totalProducido,
    [totalAProducir, totalProducido]
  );

  return (
    <DataTable
      cols={[
        'Artículo', // Articulo + Tipo
        'Talle',
        'Color', // Color + Porcentaje
        'A Producir', // Docenas
        'Producido', // Produccion Mensual
        'Falta', // A Producir - Producido
        'Target (un.)',
        'Falta (un.)',
        live && 'Máquinas',
      ]}
      colsWidths={[
        '', // Articulo + Tipo
        'w-[5%]', // Talle
        'w-[19%]', // Color + Porcentaje
        '', // Docenas
        '', // Produccion Mensual
        '', // A Producir - Producido
        '', // Target (un.)
        '', // Falta (un.)
        live && 'w-[12%]', // Maquinas
      ]}
      tfoot={[
        true,
        true,
        'Total',
        Math.round(totalAProducir) || '0', // Total A Producir
        Math.round(totalProducido) || '0', // Total Producido
        Math.round(totalFalta) || '0', // Total Falta
        true,
        true,
        live && true,
      ]}
      headerTop='top-16'
    >
      {startDate && progColor && filteredProgColor.length === 0
        ? progColor.map(mapRows)
        : filteredProgColor.map(mapRows)}
    </DataTable>
  );
}
