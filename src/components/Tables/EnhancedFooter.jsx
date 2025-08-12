import { PrintRounded } from '@mui/icons-material';
import { IconButton } from '@mui/joy';
import { useConfig } from '../../ConfigContext.jsx';
import { useLocation } from 'react-router';
import { useContext } from 'react';
import { DatesContext, ToastsContext } from '../../Contexts.js';
import { buildPdfPayload } from '../../utils/pdfPayload.js';
import dayjs from 'dayjs';

export default function EnhancedFooter({ footer, cols, rows, selected }) {
  const { apiUrl } = useConfig();
  const { pathname } = useLocation();
  const { addToast } = useContext(ToastsContext);
  const { startDate, endDate } = useContext(DatesContext);

  const getPDFOpts = () => {
    switch (pathname) {
      case '/programada/anteriores':
        return {
          title: `Programada del ${dayjs
            .tz(startDate)
            .startOf('month')
            .format('DD/MM/YYYY')}`,
          fileName: `Programada_${dayjs
            .tz(startDate)
            .startOf('month')
            .format('DD-MM-YYYY')}`,
          appendDateToTitle: false,
          footerCols: ['Docenas', 'Producido', 'falta'],
        };
      case '/produccion':
        return {
          title: `Producción del ${dayjs
            .tz(startDate)
            .format('DD/MM/YYYY HH:mm')} al ${dayjs
            .tz(endDate)
            .format('DD/MM/YYYY HH:mm')}`,
          fileName: `Produccion_${dayjs
            .tz(startDate)
            .format('DD-MM-YYYYTHH.mm')}_${dayjs
            .tz(endDate)
            .format('DD-MM-YYYYTHH.mm')}`,
          orientation: 'portrait',
          appendDateToTitle: false,
          footerCols: ['Unidades', 'Docenas'],
        };
      case '/maquinas':
        return {
          title: 'Máquinas',
          fileName: `Maquinas_${dayjs.tz().format('DD-MM-YYYYTHH.mm')}`,
        };
      default:
        return {
          title: 'Programada Actual',
          fileName: `Programada-Actual_${dayjs
            .tz()
            .format('DD-MM-YYYYTHH.mm')}`,
          footerCols: ['Docenas', 'Producido', 'falta'],
        };
    }
  };

  function getSelectedRows(rows, selected) {
    const key = (row) => `${row.Articulo}-${row.Talle}-${row.ColorId}`;
    return rows.filter((row) => selected.includes(key(row)));
  }

  const handlePDFExport = async () => {
    try {
      const selectedRows = getSelectedRows(rows, selected);
      // Build a safe, serializable payload
      const {
        columns,
        rows: parsedRows,
        footer,
      } = buildPdfPayload(cols, selectedRows, getPDFOpts().footerCols);

      const res = await fetch(`${apiUrl}/export/pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          columns,
          rows: parsedRows,
          footer,
          ...getPDFOpts(),
        }),
      });

      const data = await res.json();
      addToast({
        type: res.status === 500 ? 'danger' : 'success',
        message: data.message,
      });

      if (res.ok) {
        await window.electronAPI.openPath(data.filePath);
      }
    } catch (err) {
      console.error('[CLIENT] Error exporting PDF:', err);
    }
  };

  return (
    <tfoot className='sticky bottom-0 z-10 font-semibold'>
      <tr>
        {/* Selected */}
        <td
          colSpan={2}
          className='text-[var(--joy-palette-text-tertiary)] font-normal'
        >
          {selected.length > 0 && `${selected.length} seleccionadas`}
        </td>
        <td className='text-center'>
          {selected.length > 0 && (
            <IconButton variant='soft' onClick={handlePDFExport}>
              <PrintRounded className='text-(--joy-palette-primary-500)' />
            </IconButton>
          )}
        </td>
        {footer.filter(Boolean).map((foot, i) => (
          <td key={i} className='text-right'>
            {foot}
          </td>
        ))}
      </tr>
    </tfoot>
  );
}
