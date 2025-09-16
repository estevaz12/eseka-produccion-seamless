import dayjs from 'dayjs';
import { producidoStr } from './progTableUtils';

function stringifyCell(v) {
  if (v == null) return '';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return v.map(stringifyCell).join(', ');

  return String(v);
}

export async function buildPdfPayload(
  cols,
  rows,
  footerCols,
  addToProgramada,
  footnoteData
) {
  const cleanCols = prepCols(cols);

  const parsedRows = parseRows(rows, cols);

  const footer = buildFooter(footerCols, cols, rows);

  const footnote = addToProgramada
    ? await buildFootnote(...footnoteData)
    : null;

  return { columns: cleanCols, rows: parsedRows, footer, footnote };
}

function prepCols(cols) {
  return cols.map((c) => ({
    id: c.id,
    label: c.label ?? String(c.id ?? ''),
    align: c.pdfAlign ?? c.align ?? 'left',
  }));
}

function parseRows(rows, cols) {
  return rows.map((row) => {
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
}

function buildFooter(footerCols, cols, rows) {
  const footer = footerCols ? {} : null;
  if (footer) {
    for (const col of cols) {
      const isFooterCol = footerCols.includes(col.id);
      const isNumeric = (val) => typeof val === 'number' || !isNaN(Number(val));

      let total = null;

      if (isFooterCol) {
        const rawValues = rows.map((row) => {
          const val =
            typeof col.pdfValue === 'function'
              ? col.pdfValue(row)
              : row[col.id];

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
  }
  return footer;
}

async function buildFootnote(room, startDate, docena, porcExtra) {
  const toAdd = [];
  // get all articulos produced in the month and current programada
  const [produced, programada] = await Promise.all([
    getProduced(room),
    getProgramada(room, startDate),
  ]);

  if (produced.length === 0 && programada.length === 0) return toAdd;

  const artProduced = produced.map((row) => ({
    Articulo: row.Articulo,
    Tipo: row.Tipo,
    Talle: row.Talle,
    Color: row.Color,
    Porcentaje: null,
    Docenas: null, // A Producir
    Producido: producidoStr(
      { Tipo: row.Tipo, Producido: row.Unidades },
      docena,
      porcExtra
    ),
    falta: null,
    faltaUnidades: null,
    target: null,
    machines: [],
  }));

  if (programada.length === 0) {
    toAdd.push(...artProduced);
  } else {
    // get those that are not in programada
    const notInProgramada = artProduced.filter(
      (art) =>
        !programada.some(
          (row) =>
            row.Articulo === art.Articulo &&
            row.Talle === art.Talle &&
            row.Color === art.Color
        )
    );

    toAdd.push(...notInProgramada);
  }

  return toAdd;
}

async function getProduced(room) {
  let data = [];
  try {
    const params = new URLSearchParams({
      room,
      startDate: dayjs
        .tz()
        .startOf('month')
        .hour(6)
        .minute(0)
        .second(1)
        .format(process.env.SQL_DATE_FORMAT),
      endDate: dayjs.tz().format(process.env.SQL_DATE_FORMAT),
      actual: true,
      articulo: '',
      talle: '',
      colorId: '',
    }).toString();
    const res = await fetch(`${process.env.EXPRESS_URL}/produccion?${params}`);
    data = await res.json();
  } catch (err) {
    console.error(`[CLIENT] Error fetching /produccion:`, err);
  }

  return data;
}

async function getProgramada(room, startDate) {
  let data = [];
  try {
    const params = new URLSearchParams({
      startDate,
    }).toString();
    const res = await fetch(
      `${process.env.EXPRESS_URL}/${room}/programada?${params}`
    );
    data = await res.json();
  } catch (err) {
    console.error(`[CLIENT] Error fetching /${room}/programada:`, err);
  }

  return data;
}
