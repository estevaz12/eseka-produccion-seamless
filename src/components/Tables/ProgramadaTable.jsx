import { useEffect, useMemo } from 'react';
import { useConfig } from '../../ConfigContext.jsx';
import Typography from '@mui/joy/Typography';
import TargetCol from './TargetCol.jsx';
import {
  aProducirStr,
  calcAProducir,
  calcFaltaUnidades,
  calcProducido,
  colorStr,
  faltaStr,
  producidoStr,
  roundUpEven,
} from '../../utils/progTableUtils.js';
import EnhancedTable from './EnhancedTable.jsx';
import ArticuloCol from './ArticuloCol.jsx';
import { DatesContext } from '../../Contexts.js';
import ProgLegend from './ProgLegend.jsx';
import PendingActionsRounded from '@mui/icons-material/PendingActionsRounded';
import { useOutletContext } from 'react-router';
import { getDuration, getDurationUnix } from '../../utils/maquinasUtils.js';

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
  const { room, docena, porcExtra } = useOutletContext();

  useEffect(() => {
    let ignore = false;
    // fetch and repeat every minute
    function fetchProgColor() {
      if (startDate) {
        const params = new URLSearchParams({
          startDate,
        }).toString();
        fetch(`${apiUrl}/${room}/programada?${params}`)
          .then((res) => res.json())
          .then((data) => {
            if (!ignore) {
              setProgColor(data);
            }
          })
          .catch((err) =>
            console.error(`[CLIENT] Error fetching /${room}/programada:`, err)
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
      pdfAlign: 'left',
      pdfRender: (row) => `${row.Articulo}${row.Tipo ? row.Tipo : ''}`,
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
      pdfRender: (row) => colorStr(row),
    },
    {
      id: 'Docenas',
      label: 'A Producir',
      align: 'right',
      pdfValue: (row) => calcAProducir(row), // for footer calc
      pdfRender: (row) => aProducirStr(row), // for rendering
    },
    {
      id: 'Producido',
      label: 'Producido',
      align: 'right',
      pdfValue: (row) => calcProducido(row, docena, porcExtra),
      pdfRender: (row) => producidoStr(row, docena, porcExtra),
    },
    {
      id: 'falta',
      label: 'Falta',
      align: 'right',
      pdfValue: (row) =>
        calcAProducir(row) - calcProducido(row, docena, porcExtra),
      pdfRender: (row) => faltaStr(row, docena, porcExtra),
      sortFn: (a, b, order) => {
        const faltaCalc = (row, order) => {
          const falta = row.Docenas - row.Producido / docena / porcExtra;
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
      id: 'faltaUnidades',
      label: 'Falta (un)',
      align: 'right',
      pdfRender: (row) => row.Target - row.Producido,
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
    room === 'SEAMLESS'
      ? {
          id: 'target',
          label: 'Target (un)',
          align: 'right',
          pdfRender: (row) => {
            const faltaUnidades = calcFaltaUnidades(row);
            if (faltaUnidades <= 0) return 'LLEGÓ';

            if (row.Producido === 0 || row.Machines.length > 1)
              return row.Target;

            if (row.Machines.length <= 1)
              return roundUpEven(
                faltaUnidades + (row.Machines[0]?.Pieces || 0)
              );
          },
          sortFn: (a, b, order) => {
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
        }
      : live && {
          id: 'idealTime',
          label: 'Tiempo Min.',
          align: 'center',
          width: 'w-[12%]',
          pdfRender: (row) => {
            if (!live) return '';

            const idealTime = calcIdealTime(row);
            switch (idealTime) {
              case 0:
                return '';
              case -1:
                return 'LLEGÓ';
              default:
                return getDuration(idealTime);
            }
          },
          sortFn: (a, b, order) => {
            if (!live) return 0;

            const aIdealTime = calcIdealTime(a);
            const bIdealTime = calcIdealTime(b);

            // always place LLEGÓ at the top when asc
            // place at bottom when descending
            if (aIdealTime === -1) return order === 'asc' ? 1 : 1;
            if (bIdealTime === -1) return order === 'asc' ? -1 : -1;

            // if not LLEGÓ, sort by ideal time duration
            let aDuration = getDurationUnix(aIdealTime);
            let bDuration = getDurationUnix(bIdealTime);

            if (!aDuration) aDuration = order === 'asc' ? Infinity : -Infinity;
            if (!bDuration) bDuration = order === 'asc' ? Infinity : -Infinity;

            return bDuration - aDuration;
          },
        },
    live && {
      id: 'machines',
      label: 'Máquinas',
      width: 'w-[11%]',
      align: room === 'HOMBRE' ? 'center' : null, // left
      pdfAlign: 'center',
      pdfRender: (row) => {
        if (row.Machines.length <= 5)
          return row.Machines.map((m) => m.MachCode).join(', ');
        else return `${row.Machines.length} mqs.`;
      },
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
    const faltaUnidades = calcFaltaUnidades(row);

    const machinesList = row.Machines.map((m) => {
      return (
        <Typography key={m.MachCode}>{`${m.MachCode} ${
          room === 'SEAMLESS' ? `(P: ${m.Pieces})` : ''
        }`}</Typography>
      );
    }); // display all machines with articulo

    let rowClassName = 'bg-todo';
    if (!row.Docenas && row.Docenas !== 0)
      rowClassName = ''; // NO TIENE DISTR, FALTA ASIGNAR
    else if (row.Machines.length > 0) rowClassName = 'bg-making'; // TEJIENDO
    else if (faltaUnidades <= 0) rowClassName = 'bg-done'; // LLEGÓ
    else if (row.Machines.length === 0 && faltaUnidades <= 24)
      rowClassName = 'bg-almost-done'; // CASI LLEGÓ - Menos de dos docena
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
        />
        {/* Talle */}
        <td className='font-semibold text-center'>{row.Talle}</td>
        {/* Color + Porcentaje */}
        <td
          className='font-semibold border-x group/color'
          style={{
            backgroundColor: row.Hex,
            color: row.WhiteText ? 'white' : 'black',
          }}
        >
          <Typography className='relative w-fit'>{colorStr(row)}</Typography>
        </td>
        {/* A Producir */}
        <td className='text-right group/prod'>
          {row.Docenas === null ? <PendingActionsRounded /> : aProducirStr(row)}
        </td>
        {/* Producido */}
        <td className='text-right'>{producidoStr(row, docena, porcExtra)}</td>
        {/* Falta */}
        <td className='text-right'>{faltaStr(row, docena, porcExtra)}</td>
        {/* Falta (un.) */}
        <td className='text-right'>{faltaUnidades}</td>
        {/* Target (un.) or Tiempo al 100% */}
        {room === 'SEAMLESS' ? (
          <td className='text-right'>
            <TargetCol row={row} faltaUnidades={faltaUnidades} />
          </td>
        ) : live ? (
          <td className='text-center'>
            {calcIdealTime(row) === -1
              ? 'LLEGÓ'
              : getDuration(calcIdealTime(row))}
          </td>
        ) : null}
        {/* Maquinas */}
        {live && (
          <td className={room === 'HOMBRE' ? 'text-center' : ''}>
            {machinesList}
          </td>
        )}
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
    return progToUse.reduce(
      (acc, row) => acc + calcProducido(row, docena, porcExtra),
      0
    );
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
        pdfRows={progColor}
        renderRow={renderRow}
        initOrder='asc'
        initOrderBy='Articulo'
        footer={[
          'Total',
          Math.round(totalAProducir) || '0', // Total A Producir
          Math.round(totalProducido) || '0', // Total Producido
          Math.round(totalFalta) || '0', // Total Falta
          !live && room === 'HOMBRE' ? <ProgLegend live={false} /> : true,
          !live && room === 'SEAMLESS' ? (
            <ProgLegend live={live} />
          ) : !live && room === 'HOMBRE' ? (
            false
          ) : (
            true
          ),
          live && <ProgLegend live={live} />,
        ]}
        headerTop='top-[94px]'
        stripe=''
        checkboxVariant='soft'
      />
    </DatesContext>
  );
}

function calcIdealTime(row) {
  if (row.Machines.length === 0) return 0;

  const faltaUnidades = row.Target - row.Producido;
  if (faltaUnidades <= 0) return -1; // target was reached

  const maxIdealCycle = Math.max(...row.Machines.map((m) => m.IdealCycle));
  if (maxIdealCycle === 0) return 0;

  const seconds = maxIdealCycle * faltaUnidades;
  const secondsPerMach = seconds / row.Machines.length;
  return secondsPerMach;
}
