import { formatNum } from './progTableUtils';

function stringifyCell(v) {
  if (v == null) return '';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return v.map(stringifyCell).join(', ');

  return String(v);
}

export function buildPdfPayload(cols, rows, footerCols) {
  const cleanCols = cols.map((c) => ({
    id: c.id,
    label: c.label ?? String(c.id ?? ''),
    align: c.pdfAlign ?? c.align ?? 'left',
  }));

  const parsedRows = rows.map((row) => {
    const out = {};
    for (const col of cols) {
      let val;
      if (typeof col.pdfRender === 'function') {
        val = col.pdfRender(row);
      } else {
        // Default to the actual data key (case-sensitive)
        val = row[col.id];
      }

      out[col.id] = stringifyCell(val);
    }
    return out;
  });

  // build footer
  const footer = {};
  for (const col of cols) {
    const isFooterCol = footerCols.includes(col.id);
    const isNumeric = (val) => typeof val === 'number' || !isNaN(Number(val));

    let total = null;

    if (isFooterCol) {
      const rawValues = rows.map((row) => {
        const val =
          typeof col.pdfValue === 'function' ? col.pdfValue(row) : row[col.id];

        return val;
      });

      const numericValues = rawValues
        .map((v) => Number(v))
        .filter((n) => isNumeric(n));

      if (numericValues.length) {
        total = numericValues.reduce((a, b) => a + b, 0);
      }
    }

    // Apply 'Total' label to third column
    if (col.id === cols[2].id) {
      footer[col.id] = 'Total';
    } else if (total != null) {
      footer[col.id] = String(Math.round(total));
    } else {
      footer[col.id] = '';
    }
  }

  return { columns: cleanCols, rows: parsedRows, footer };
}
