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
      pdfValue: (row) => calcProducido(row),
      pdfRender: (row) => producidoStr(row),
    },
    {
      id: 'falta',
      label: 'Falta',
      align: 'right',
      pdfValue: (row) => calcAProducir(row) - calcProducido(row),
      pdfRender: (row) => faltaStr(row),
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
      pdfRender: (row) => {
        const faltaUnidades = calcFaltaUnidades(row);
        if (faltaUnidades <= 0) return 'LLEGÓ';

        if (row.Producido === 0 || row.Machines.length > 1) return row.Target;

        if (row.Machines.length <= 1)
          return roundUpEven(faltaUnidades + (row.Machines[0]?.Pieces || 0));
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
    live && {
      id: 'machines',
      label: 'Máquinas',
      width: 'w-[11%]',
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
        <td className='text-right group/prod'>{row.Docenas === null ? <PendingActionsRounded /> : aProducirStr(row)}</td>
        {/* Producido */}
        <td className='text-right'>{producidoStr(row)}</td>
        {/* Falta */}
        <td className='text-right'>{faltaStr(row)}</td>
        {/* Target (un.) */}
        <td className='text-right'>
          <TargetCol row={row} faltaUnidades={faltaUnidades} />
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
        pdfRows={progColor}
        renderRow={renderRow}
        initOrder='asc'
        initOrderBy='Articulo'
        footer={[
          'Total',
          Math.round(totalAProducir) || '0', // Total A Producir
          Math.round(totalProducido) || '0', // Total Producido
          Math.round(totalFalta) || '0', // Total Falta
          true,
          !live ? <ProgLegend live={false} /> : true,
          live && <ProgLegend live={false} />,
        ]}
        headerTop='top-[94px]'
        stripe=''
        checkboxVariant='soft'
      />
    </DatesContext>
  );
}
