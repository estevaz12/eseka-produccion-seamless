import { useEffect, useState } from 'react';
import { useConfig } from '../ConfigContext.jsx';
import DataTable from './DataTable.jsx';

let apiUrl;

// TODO - handle articulos incompletos
export default function ProgramadaTable({ startDate }) {
  apiUrl = useConfig().apiUrl;
  const [progColor, setProgColor] = useState([]);
  const [machines, setMachines] = useState([]);

  useEffect(() => {
    let ignore = false;

    // fetch and repeat every minute
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
        });
    }

    const intervalId = setInterval(() => {
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
          });
      }
    }, 60000); // update every minute

    return () => {
      clearInterval(intervalId);
      ignore = true;
    };
  }, [startDate]);

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
      {startDate &&
        progColor &&
        machines &&
        progColor.map((row) => {
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
          const faltaFisico = (
            (row.Target - row.Producido) /
            12 /
            1.01
          ).toFixed(1);
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
                row.Porcentaje && row.Porcentaje < 100
                  ? `(${row.Porcentaje}%)`
                  : ''
              }`}</td>
              {/* Target (un.) */}
              <td>{row.Target}</td>
              {/* A Producir */}
              <td>
                {row.Tipo === null
                  ? aProducir
                  : `${aProducir} (${row.Docenas})`}
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
        })}
    </DataTable>
  );
}
