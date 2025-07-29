import { Sheet, Table, Typography } from '@mui/joy';
import { useContext, useEffect, useState } from 'react';
import { useConfig } from '../../ConfigContext.jsx';
import dayjs from 'dayjs';
import { DatesContext } from '../../Contexts.js';

let apiUrl;
export default function ExpandedRow({ numCols, row }) {
  apiUrl = useConfig().apiUrl;
  const { startDate, fromMonthStart, endDate } = useContext(DatesContext);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams({
      articulo: row.Articulo,
      talle: row.Talle,
      color: row.ColorId,
      startDate,
      fromMonthStart,
      endDate,
    });
    fetch(`${apiUrl}/historial?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setHistory(data);
      })
      .catch((err) =>
        console.error(
          `[CLIENT] Error fetching /historial for art. ${row.Articulo} T${row.Talle} ${row.Color}:`,
          err
        )
      );
  }, [
    row.Articulo,
    row.Talle,
    row.Color,
    row.ColorId,
    startDate,
    fromMonthStart,
    endDate,
  ]);

  return (
    <tr>
      <td style={{ height: 0, padding: 0 }} colSpan={numCols}>
        <Sheet
          variant='soft'
          sx={{
            p: 1,
            px: 6,
            boxShadow: 'inset 0 3px 6px 0 rgba(0 0 0 / 0.08)',
          }}
        >
          <Typography level='body-lg' component='div' className='text-left!'>
            Historial
          </Typography>
          <Table
            borderAxis='bothBetween'
            size='sm'
            hoverRow
            aria-label='historial'
            sx={{
              '& tr > *:nth-of-type(1)': {
                textAlign: 'left !important',
              },
              '& > thead > tr > th:nth-of-type(n + 5), & > tbody > tr > td:nth-of-type(n + 5)':
                { textAlign: 'right !important' },
              '--TableCell-paddingX': '0.5rem',
            }}
          >
            <thead>
              <tr>
                <th className='w-[20%]'>Fecha</th>
                <th className='w-[5%]'>Turno</th>
                <th className='w-[10%]'>Máquina</th>
                <th className=''>StyleCode</th>
                <th>Prendas</th>
                <th>OrderPieces</th>
                <th>Target</th>
                <th>Discards</th>
              </tr>
            </thead>
            <tbody>
              {history.map((historyRow) => (
                <tr key={historyRow.DateRec}>
                  <td>
                    {dayjs.tz(historyRow.DateRec).format('DD-MM-YYYY HH:mm:ss')}
                  </td>
                  <td>{historyRow.Shift}</td>
                  <td>{historyRow.MachCode}</td>
                  <td>{historyRow.StyleCode}</td>
                  <td>{historyRow.Pieces}</td>
                  <td>{historyRow.OrderPieces}</td>
                  <td>{historyRow.TargetPieces}</td>
                  <td>{historyRow.Discards}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Sheet>
      </td>
    </tr>
  );
}
