import { useEffect, useMemo, useState } from 'react';
import { useConfig } from '../../ConfigContext.jsx';
import DataTable from './DataTable.jsx';
import { Typography } from '@mui/joy';
import TargetCol from './TargetCol.jsx';
import {
  calcAProducir,
  calcProducido,
  formatNum,
} from '../../utils/progTableUtils.js';
import AProducirCol from './AProducirCol.jsx';
import EditChip from './EditChip.jsx';

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
        <td className='group'>
          {`${row.Articulo}${row.Tipo ? row.Tipo : ''}`}
          <EditChip articulo={row.Articulo} tipo={row.Tipo} />
        </td>
        {/* Talle */}
        <td>{row.Talle}</td>
        {/* Color + Porcentaje */}
        <td>{`${row.Color} ${
          row.Porcentaje && row.Porcentaje < 100 ? `(${row.Porcentaje}%)` : ''
        }`}</td>
        {/* A Producir */}
        <td>
          <AProducirCol
            row={row}
            aProducir={aProducir}
            startDate={startDate}
            setProgColor={setProgColor}
            setFilteredProgColor={setFilteredProgColor}
            setMachines={setMachines}
          />
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
        <td>
          {faltaUnidades <= 0 ? (
            'LLEGÓ'
          ) : (
            <TargetCol
              row={row}
              faltaUnidades={faltaUnidades}
              matchingMachines={matchingMachines}
            />
          )}
        </td>
        {/* Falta (un.) */}
        <td>{faltaUnidades}</td>
        {/* Maquinas */}
        {live && <td>{machinesList}</td>}
      </tr>
    );
  }

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
      stripe=''
    >
      {startDate && progColor && filteredProgColor.length === 0
        ? progColor.map(mapRows)
        : filteredProgColor.map(mapRows)}
    </DataTable>
  );
}
