import { IconButton, Sheet, Stack, Table, Typography } from '@mui/joy';
import { useContext, useEffect, useState } from 'react';
import { useConfig } from '../../ConfigContext.jsx';
import dayjs from 'dayjs';
import { DatesContext } from '../../Contexts.js';
import {
  KeyboardArrowLeftRounded,
  KeyboardArrowRightRounded,
} from '@mui/icons-material';
import TableSkeleton from './TableSkeleton.jsx';

let apiUrl;
export default function ExpandedRow({ numCols, row }) {
  apiUrl = useConfig().apiUrl;
  const { startDate, fromMonthStart, endDate } = useContext(DatesContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_LENGTH = 5; // each page will have 5 rows

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
        setLoading(false);
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

  const pageStart = (currPage) => {
    return currPage * PAGE_LENGTH - (PAGE_LENGTH - 1);
  };

  const pageEnd = (currPage) => {
    return currPage * PAGE_LENGTH;
  };

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
          <Stack direction='row' className='justify-between'>
            <Typography level='body-lg' component='div' className='text-left!'>
              Historial
            </Typography>
            {history.length > 5 && (
              <Stack direction='row' className='items-center gap-2'>
                <Typography level='body-sm' className='text-right!'>
                  {pageStart(page) === history.length
                    ? ''
                    : `${pageStart(page)}-`}
                  {pageEnd(page) < history.length
                    ? pageEnd(page)
                    : history.length}{' '}
                  de {history.length}
                </Typography>
                <Stack direction='row' className='items-center'>
                  <IconButton
                    variant='soft'
                    size='sm'
                    onClick={() => {
                      if (page > 1) setPage(page - 1);
                    }}
                  >
                    <KeyboardArrowLeftRounded />
                  </IconButton>
                  <IconButton
                    variant='soft'
                    size='sm'
                    onClick={() => {
                      if (pageEnd(page) < history.length) setPage(page + 1);
                    }}
                  >
                    <KeyboardArrowRightRounded />
                  </IconButton>
                </Stack>
              </Stack>
            )}
          </Stack>
          <Table
            borderAxis='bothBetween'
            size='sm'
            hoverRow
            aria-label='historial'
            sx={{
              '& tr > *:nth-of-type(1)': {
                textAlign: 'left !important',
              },
              '& tr > *:nth-of-type(n + 2)': {
                textAlign: 'center !important',
              },
              '& tr > *:nth-of-type(n + 5)': { textAlign: 'right !important' },
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
              {loading ? (
                <TableSkeleton numCols={8} numRows={5} />
              ) : (
                history
                  .slice(pageStart(page) - 1, pageEnd(page))
                  .map((historyRow) => (
                    <tr key={`${historyRow.MachCode}-${historyRow.DateRec}`}>
                      <td>
                        {dayjs
                          .tz(historyRow.DateRec)
                          .format('DD-MM-YYYY HH:mm:ss')}
                      </td>
                      <td>{historyRow.Shift}</td>
                      <td>{historyRow.MachCode}</td>
                      <td>{historyRow.StyleCode}</td>
                      <td>{historyRow.Pieces}</td>
                      <td>{historyRow.OrderPieces}</td>
                      <td>{historyRow.TargetPieces}</td>
                      <td>{historyRow.Discards}</td>
                    </tr>
                  ))
              )}
            </tbody>
          </Table>
        </Sheet>
      </td>
    </tr>
  );
}
