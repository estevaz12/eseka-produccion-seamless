import { useEffect, useMemo } from 'react';
import { useConfig } from '../../ConfigContext.jsx';
import { Typography } from '@mui/joy';
import TargetCol from './TargetCol.jsx';
import {
  calcAProducir,
  calcProducido,
  formatNum,
  roundUpEven,
} from '../../utils/progTableUtils.js';
import AProducirCol from './AProducirCol.jsx';
import EnhancedTable from './EnhancedTable.jsx';
import ArticuloCol from './ArticuloCol.jsx';
import { DatesContext } from '../../Contexts.js';
import ProgLegend from './ProgLegend.jsx';
import EditArtBtn from './EditArtBtn.jsx';

let apiUrl;

export default function ProgramadaTable({
  startDate,
  progColor,
  setProgColor,
  filteredProgColor,
  setFilteredProgColor,
  editable = true,
  live = true,
}) {
  apiUrl = useConfig().apiUrl;

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
              setProgColor(data);
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

  const cols = [
    {
      id: 'Articulo',
      label: 'Artículo',
      align: 'right',
      labelWidth: 'min-w-16',
    },
    {
      id: 'Talle',
      label: 'Talle',
      align: 'center',
      width: 'w-[7%]',
    },
    {
      id: 'Color',
      label: 'Color',
      width: 'w-[18%]',
    },
    {
      id: 'Docenas',
      label: 'A Producir',
      align: 'right',
    },
    {
      id: 'Producido',
      label: 'Producido',
      align: 'right',
    },
    {
      id: 'falta',
      label: 'Falta',
      align: 'right',
      sortFn: (a, b, order) => {
        const faltaCalc = (row, order) => {
          const falta = row.Docenas - row.Producido / 12 / 1.01;
          // send to bottom if falta is negative
          if (falta <= 0) {
            return order === 'asc' ? Number.POSITIVE_INFINITY : 0;
          }
          return falta;
        };

        const aFalta = faltaCalc(a, order);
        const bFalta = faltaCalc(b, order);
        return bFalta - aFalta;
      },
    },
    {
      id: 'target',
      label: 'Target (un)',
      align: 'right',
      sortFn: (a, b, order) => {
        // TODO: test for multiple machines
        const targetCalc = (row, order) => {
          const faltaUn = row.Target - row.Producido;
          // send to bottom if target was met
          if (faltaUn <= 0) {
            return order === 'asc' ? Number.POSITIVE_INFINITY : 0;
          }

          return row.Producido === 0
            ? row.Target
            : roundUpEven(
                faltaUn +
                  row.Machines.reduce(
                    (acc, mach) => acc + (mach.Pieces || 0),
                    0
                  )
              );
        };

        const aTarget = targetCalc(a, order);
        const bTarget = targetCalc(b, order);
        return bTarget - aTarget;
      },
    },
    {
      id: 'faltaUnidades',
      label: 'Falta (un)',
      align: 'right',
      sortFn: (a, b, order) => {
        const faltaCalc = (row, order) => {
          const faltaUn = row.Target - row.Producido;
          // send to bottom if falta is negative
          if (faltaUn <= 0) {
            return order === 'asc' ? Infinity : 0;
          }
          return faltaUn;
        };

        const aFaltaUn = faltaCalc(a, order);
        const bFaltaUn = faltaCalc(b, order);
        return bFaltaUn - aFaltaUn;
      },
    },
    live && {
      id: 'machines',
      label: 'Máquinas',
      width: 'w-[11%]',
      sortFn: (a, b, order) => {
        // machines is sorted, so compare only first machine if multiple
        let aMachine = a.Machines[0]?.MachCode;
        let bMachine = b.Machines[0]?.MachCode;

        // // send articulos with no machines to the bottom depending on order
        if (!aMachine) aMachine = order === 'asc' ? Infinity : -Infinity;
        if (!bMachine) bMachine = order === 'asc' ? Infinity : -Infinity;

        return bMachine - aMachine;
      },
    },
  ];

  function renderRow(row, i, opened, handleClick) {
    const aProducir = formatNum(calcAProducir(row));
    const producido = formatNum(calcProducido(row));
    const falta = formatNum(calcAProducir(row) - calcProducido(row));
    const faltaFisico = formatNum((row.Target - row.Producido) / 12 / 1.01);
    const faltaUnidades = row.Target - row.Producido;

    const machinesList = row.Machines.map((m) => {
      return (
        <Typography
          key={m.MachCode}
        >{`${m.MachCode} (P: ${m.Pieces})`}</Typography>
      );
    }); // display all machines with articulo

    let rowClassName = 'bg-todo';
    if (!row.Docenas && row.Docenas !== 0)
      rowClassName = ''; // NO TIENE DISTR, FALTA ASIGNAR
    else if (row.Machines.length > 0) rowClassName = 'bg-making'; // TEJIENDO
    else if (faltaUnidades <= 0) rowClassName = 'bg-done'; // LLEGÓ
    else if (row.Machines.length === 0 && faltaUnidades <= 12)
      rowClassName = 'bg-almost-done'; // CASI LLEGÓ - Menos de una docena
    else if (row.Machines.length === 0 && faltaUnidades < row.Target)
      rowClassName = 'bg-incomplete'; // INCOMPLETO

    rowClassName = `${rowClassName} *:border-dark-accent hover:bg-row-hover`;

    return [
      rowClassName,
      // Render each cell in the row
      <>
        {/* Articulo */}
        <ArticuloCol
          row={row}
          isOpen={opened === `${row.Articulo}-${row.Talle}-${row.ColorId}`}
          handleRowClick={handleClick}
          rowColor={rowClassName}
          editable={editable}
          className='font-semibold'
        />
        {/* Talle */}
        <td className='font-semibold text-center'>{row.Talle}</td>
        {/* Color + Porcentaje */}
        <td className='font-semibold group/color'>
          <Typography
            className='relative w-fit'
            endDecorator={
              live && (
                <EditArtBtn
                  articulo={row.Articulo}
                  tipo={row.Tipo}
                  talle={row.Talle}
                />
              )
            }
          >
            {`${row.Color} ${
              row.Porcentaje && row.Porcentaje < 100
                ? `(${row.Porcentaje}%)`
                : ''
            }`}
          </Typography>
        </td>
        {/* A Producir */}
        <td className='text-right group/prod'>
          <AProducirCol
            row={row}
            aProducir={aProducir}
            startDate={startDate}
            setProgColor={setProgColor}
            setFilteredProgColor={setFilteredProgColor}
            live={live}
          />
        </td>
        {/* Producido */}
        <td className='text-right'>
          {row.Tipo === null
            ? producido
            : `${producido} (${formatNum(row.Producido / 12 / 1.01)})`}
        </td>
        {/* Falta */}
        <td className='text-right'>
          {row.Tipo == null ? falta : `${falta} (${faltaFisico})`}
        </td>
        {/* Target (un.) */}
        <td className='text-right'>
          {faltaUnidades <= 0 ? (
            'LLEGÓ'
          ) : (
            <TargetCol row={row} faltaUnidades={faltaUnidades} />
          )}
        </td>
        {/* Falta (un.) */}
        <td className='text-right'>{faltaUnidades}</td>
        {/* Maquinas */}
        {live && <td>{machinesList}</td>}
      </>,
    ];
  }

  // Memoized totals for footer
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
    <DatesContext value={{ startDate, fromMonthStart: true, endDate: null }}>
      <EnhancedTable
        cols={cols}
        rows={
          startDate && progColor && filteredProgColor.length === 0
            ? progColor
            : filteredProgColor
        }
        renderRow={renderRow}
        initOrder='asc'
        initOrderBy='Articulo'
        footer={[
          'Total',
          Math.round(totalAProducir) || '0', // Total A Producir
          Math.round(totalProducido) || '0', // Total Producido
          Math.round(totalFalta) || '0', // Total Falta
          true,
          !live ? <ProgLegend live={live} /> : true,
          live && <ProgLegend live={live} />,
        ]}
        headerTop='top-[94px]'
        stripe=''
        checkboxVariant='soft'
      />
    </DatesContext>
  );
}
