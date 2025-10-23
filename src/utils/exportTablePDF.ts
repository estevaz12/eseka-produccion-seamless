import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import os from 'os';
import type { FooterRow, PDFCol, TableRow } from '../types';

/**
 * Export rows to a table PDF.
 *
 * @param {Object} opts
 * @param {Array<Object>} opts.columns - Column definitions:
 *   [{ id: 'Articulo', label: 'Artículo', align: 'right'|'left'|'center',
 *      value?: (row) => any }]
 *   - Falsy entries (e.g., live && {...}) are ignored.
 * @param {Array<Object>} opts.rows - Data rows (selected).
 * @param {string} [opts.title=''] - Title on first page.
 * @param {string} [opts.filePath] - Output path. Defaults to cwd/title_of_table.pdf.
 * @param {'A4'|'LETTER'|[number,number]} [opts.pageSize='A4']
 * @param {'portrait'|'landscape'} [opts.orientation='portrait']
 * @param {Object} [opts.margins] - {top,right,bottom,left} in pts.
 * @param {number} [opts.rowHeight=24] - Row height in pts.
 * @param {number} [opts.cellPadding=6] - Horizontal padding inside cells.
 * @param {string} [opts.font='Helvetica'] - Built-in PDFKit font name or registered font.
 * @param {string} [opts.headerFont='Helvetica-Bold']
 * @param {number} [opts.fontSize=10]
 * @param {number} [opts.headerFontSize=10]
 * @param {number} [opts.titleFontSize=14]
 * @param {boolean} [opts.appendDateToTitle=true]
 * @returns {Promise<string>} Resolves to output file path.
 */
interface PDFOpts {
  readonly columns: PDFCol[];
  readonly rows: TableRow[];
  readonly footer: FooterRow;
  readonly footnote: TableRow;
  readonly title: string;
  readonly fileName: string;
  readonly pageSize: 'A4' | 'LETTER' | [number, number];
  readonly orientation: 'landscape' | 'portrait';
  readonly margins: MarginOpts;
  readonly rowHeight: number;
  readonly cellPadding: number;
  readonly font: string;
  readonly headerFont: string;
  readonly fontSize: number;
  readonly headerFontSize: number;
  readonly titleFontSize: number;
  readonly appendDateToTitle: boolean;
}

interface MarginOpts {
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
}

type alignment = 'left' | 'center' | 'right';

function exportTablePDF(opts: PDFOpts) {
  const {
    columns,
    rows,
    footer,
    footnote,
    title = '',
    fileName,
    pageSize = 'A4',
    orientation = 'landscape',
    margins = { top: 36, right: 36, bottom: 36, left: 36 },
    rowHeight = 24,
    cellPadding = 6,
    font = 'Helvetica',
    headerFont = 'Helvetica-Bold',
    fontSize = 10,
    headerFontSize = 10,
    titleFontSize = 14,
    appendDateToTitle = true,
  }: PDFOpts = opts;
  const firstColExtraPadding = 20;

  if (!Array.isArray(columns) || columns.length === 0) {
    return Promise.reject(new Error('columns array is required'));
  }
  if (!Array.isArray(rows)) {
    return Promise.reject(new Error('rows must be an array'));
  }

  // Always export to tmp folder using fileName
  const outPath = path.join(
    os.tmpdir(),
    `${sanitizeFileName(fileName ?? title ?? 'print')}.pdf`
  );

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: pageSize,
      layout: orientation,
      margins: { top: 0, right: 0, bottom: 0, left: 0 }, // we manage our own
    });

    const stream = fs.createWriteStream(outPath);
    doc.pipe(stream);

    try {
      // Page metrics
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const leftX = margins.left;
      const rightX = pageWidth - margins.right;
      const tableWidth = Math.max(0, rightX - leftX);

      // Title (first page only)
      let y = margins.top;
      const fullTitle =
        appendDateToTitle && title ? `${title} — ${formatNow()}` : title;

      if (fullTitle) {
        doc.font(headerFont).fontSize(titleFontSize);
        const tW = doc.widthOfString(fullTitle);
        const tX = leftX + (tableWidth - tW) / 2;
        const tY = y;
        doc.text(fullTitle, tX, tY, { lineBreak: false });
        y += titleFontSize + 8; // gap under title
      }

      // Column widths (auto-fit with padding, scaled to table)
      const colWidths = autoColWidths(doc, {
        columns,
        rows,
        tableWidth,
        cellPadding,
        font,
        headerFont,
        fontSize,
        headerFontSize,
      });

      // Draw loop
      const drawHeader = () => {
        // Header box
        doc.rect(leftX, y, tableWidth, rowHeight).stroke();

        // Header text centered
        doc.font(headerFont).fontSize(headerFontSize);
        let x = leftX;
        for (let i = 0; i < columns.length; i++) {
          const label = columns[i].label || '';
          const w = colWidths[i];
          const align: alignment = columns[i].align || 'left';
          const ty = y + (rowHeight - headerFontSize) / 2;
          const cPad =
            i === 0 ? cellPadding + firstColExtraPadding : cellPadding;
          drawAlignedText(doc, label, x, ty, w, align, cPad);
          x += w;
        }
        y += rowHeight;
      };

      const drawRow = (row: TableRow) => {
        // Bottom separator
        doc
          .moveTo(leftX, y + rowHeight)
          .lineTo(leftX + tableWidth, y + rowHeight)
          .stroke();

        doc.font(font).fontSize(fontSize);
        let x = leftX;
        for (let i = 0; i < columns.length; i++) {
          const col = columns[i];
          const w = colWidths[i];
          const raw = row[col.id];
          const s = stringifyCell(raw);
          const maxInner = Math.max(0, w - 2 * cellPadding);
          const fitted = fitTextToWidth(doc, s, maxInner);
          const topY = y + (rowHeight - fontSize) / 2;
          const cPad =
            i === 0 ? cellPadding + firstColExtraPadding : cellPadding;
          drawAlignedText(doc, fitted, x, topY, w, col.align, cPad);
          x += w;
        }
        y += rowHeight;
      };

      // First header
      drawHeader();

      // Rows with pagination
      const bottomLimit = pageHeight - margins.bottom;
      for (const row of rows) {
        if (y + rowHeight > bottomLimit) {
          doc.addPage();
          y = margins.top;
          // Re-draw header on new page (no title)
          drawHeader();
        }
        drawRow(row);
      }

      // Footer / summary row
      if (footer && typeof footer === 'object') {
        if (y + rowHeight > bottomLimit) {
          doc.addPage();
          y = margins.top;
          drawHeader();
        }

        // Optional: border/background for emphasis
        doc.rect(leftX, y, tableWidth, rowHeight).stroke();
        // Example background (commented out):
        // doc.save().rect(leftX, y, tableWidth, rowHeight).fill('#f5f5f5').restore();

        // Choose emphasis font or normal
        const footerIsEmphasis = true;
        const activeFont = footerIsEmphasis ? headerFont : font;
        const activeFontSize = footerIsEmphasis ? headerFontSize : fontSize;

        doc.font(activeFont).fontSize(activeFontSize);

        let x = leftX;
        for (let i = 0; i < columns.length; i++) {
          const col = columns[i];
          const w = colWidths[i];
          const raw = footer[col.id] ?? '';
          const s = stringifyCell(raw);
          const maxInner = Math.max(0, w - 2 * cellPadding);
          const fitted = fitTextToWidth(doc, s, maxInner);

          // custom alignment for label ("Total")
          const align = i === 2 ? 'right' : col.align || 'left';

          const topY = y + (rowHeight - activeFontSize) / 2;
          const cPad =
            i === 0 ? cellPadding + firstColExtraPadding : cellPadding;
          drawAlignedText(doc, fitted, x, topY, w, align, cPad);
          x += w;
        }

        y += rowHeight;
      }

      // Footnote (if any)
      if (footnote && Array.isArray(footnote) && footnote.length > 0) {
        // Add some vertical spacing before the footnote section
        y += rowHeight * 2;

        // Check for page break
        if (y + rowHeight > bottomLimit) {
          doc.addPage();
          y = margins.top;
        }

        // Draw footnote title
        const footnoteTitle =
          'AVISO: No se encontraron estos artículos en la Programada';
        doc.font(headerFont).fontSize(headerFontSize);
        doc.text(footnoteTitle, leftX, y);
        y += headerFontSize + 6;

        // Draw header for footnote table
        drawHeader();

        // Draw each footnote row
        for (const row of footnote) {
          if (y + rowHeight > bottomLimit) {
            doc.addPage();
            y = margins.top;
            drawHeader();
          }
          drawRow(row);
        }
      }

      doc.end();
    } catch (err) {
      // Ensure the PDF doc is ended and the underlying stream is closed.
      // Use a safe end() call and destroy the writable stream to avoid leaking the file descriptor.
      try {
        doc.end();
      } catch {
        // ignore if ending the doc fails
      }

      // Destroy the stream (Node Writable) and reject
      if (typeof stream.destroy === 'function') {
        stream.destroy(err as Error);
      }
      return reject(err);
    }

    stream.on('finish', () => resolve(outPath));
    stream.on('error', reject);
  });
}

// ——— Helpers ———

/**
 * Sanitizes a file name by replacing special characters
 * and trimming it down to 180 characters.
 * @param {string} s - The file name to sanitize
 * @return {string} The sanitized file name
 */
function sanitizeFileName(s: string) {
  return String(s)
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .slice(0, 180);
}

/**
 * Returns the current date and time as a string in the format
 * DD/MM/YYYY HH:MM
 * @return {string} The formatted date and time
 */
function formatNow() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

/**
 * Returns a string representation of the given value.
 * If the value is null or undefined, returns an empty string.
 * If the value is a number, returns the number as a string.
 * If the value is a string, returns the string itself.
 * If the value is an array, returns a string with each element
 *   separated by a comma and a space.
 * If the value is an object with a single key, returns the value
 *   of that key as a string.
 * If the value is an object with multiple keys, returns the object
 *   as a JSON string.
 * If the value is not serializable to JSON (e.g., a function),
 *   returns the result of calling `String(v)`.
 * @param {*} v - The value to stringify
 * @return {string} The string representation of the value
 */
function stringifyCell(v: any): string {
  if (v == null) return '';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return v.map((el) => stringifyCell(el)).join(', ');
  if (typeof v === 'object') {
    // Compact single-field objects; otherwise JSON
    const keys = Object.keys(v);
    if (keys.length === 1) return stringifyCell(v[keys[0]]);
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }
  return String(v);
}

/**
 * Fits the given text within the specified maximum width by truncating
 * and appending an ellipsis if necessary.
 *
 * Performs a binary search to find the maximum prefix of the text that
 * fits within the `maxWidth`, appending the specified ellipsis if
 * truncation occurs.
 *
 * @param {object} doc - PDFKit document instance used to measure text width.
 * @param {string} text - The text to fit within the maximum width.
 * @param {number} maxWidth - The maximum allowable width for the text.
 * @param {string} [ellipsis='…'] - The ellipsis string to append when text is truncated.
 * @returns {string} The fitted text, truncated with ellipsis if necessary.
 */

function fitTextToWidth(
  doc: PDFKit.PDFDocument,
  text: string,
  maxWidth: number,
  ellipsis: string = '…'
) {
  if (!text) return '';
  const fullW = doc.widthOfString(text);
  if (fullW <= maxWidth) return text;
  const ellW = doc.widthOfString(ellipsis);
  if (ellW > maxWidth) return ''; // nothing fits

  // Binary search for max prefix
  let lo = 0,
    hi = text.length;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const s = text.slice(0, mid) + ellipsis;
    const w = doc.widthOfString(s);
    if (w <= maxWidth) lo = mid + 1;
    else hi = mid - 1;
  }
  return text.slice(0, Math.max(0, hi)) + ellipsis;
}

/**
 * Calculates the x-coordinate of a text string, aligned within a cell of a
 * given width, using the specified alignment and cell padding.
 *
 * @param {object} doc - PDFKit document instance used to measure text width.
 * @param {string} text - The text string to position.
 * @param {number} x - The left x-coordinate of the cell.
 * @param {number} width - The width of the cell.
 * @param {string} [align='left'] - The alignment of the text within the cell.
 *   Supported values: 'left', 'center', 'right'.
 * @param {number} [cellPadding=6] - The horizontal padding inside the cell.
 * @returns {number} The x-coordinate of the text string, aligned within the cell.
 */
function alignedX(
  doc: PDFKit.PDFDocument,
  text: string,
  x: number,
  width: number,
  align: alignment = 'left',
  cellPadding: number = 6
) {
  const textW = doc.widthOfString(text || '');
  if (align === 'right') return x + width - cellPadding - textW;
  if (align === 'center') return x + (width - textW) / 2;
  return x + cellPadding; // left/default
}

/**
 * Draws the given text string at the specified y-coordinate, aligned within a
 * cell of a given width, using the specified alignment and cell padding.
 *
 * @param {object} doc - PDFKit document instance used to measure text width.
 * @param {string} text - The text string to draw.
 * @param {number} x - The left x-coordinate of the cell.
 * @param {number} y - The y-coordinate of the text string.
 * @param {number} width - The width of the cell.
 * @param {string} [align='left'] - The alignment of the text within the cell.
 *   Supported values: 'left', 'center', 'right'.
 * @param {number} [cellPadding=6] - The horizontal padding inside the cell.
 */
function drawAlignedText(
  doc: PDFKit.PDFDocument,
  text: string,
  x: number,
  y: number,
  width: number,
  align: alignment = 'left',
  cellPadding: number = 6
) {
  const tx = alignedX(doc, text, x, width, align, cellPadding);
  doc.text(text || '', tx, y, { lineBreak: false });
}

/**
 * Calculates optimal column widths for the given table configuration.
 *
 * @param {object} doc - PDFKit document instance used to measure text width.
 * @param {object} cfg - Table configuration:
 *   - cols: Array of column definitions.
 *   - rows: Array of row data.
 *   - tableWidth: The total width of the table.
 *   - cellPadding: The horizontal padding inside cells.
 *   - font: The font name.
 *   - headerFont: The font name for header cells.
 *   - fontSize: The font size.
 *   - headerFontSize: The font size for header cells.
 *
 * @returns {Array<number>} An array of column widths.
 */
interface TableCfg {
  columns: PDFCol[];
  rows: TableRow[];
  tableWidth: number;
  cellPadding: number;
  font: string;
  headerFont: string;
  fontSize: number;
  headerFontSize: number;
}

function autoColWidths(doc: PDFKit.PDFDocument, cfg: TableCfg) {
  const {
    columns,
    rows,
    tableWidth,
    cellPadding,
    font,
    headerFont,
    fontSize,
    headerFontSize,
  } = cfg;

  const n = columns.length;
  const widths = new Array<number>(n).fill(0);

  // Header widths
  doc.font(headerFont).fontSize(headerFontSize);
  for (let i = 0; i < n; i++) {
    const w = doc.widthOfString(columns[i].label || '') + 2 * cellPadding;
    widths[i] = Math.max(widths[i], w);
  }

  // Row widths
  doc.font(font).fontSize(fontSize);
  for (const row of rows) {
    for (let i = 0; i < n; i++) {
      const col = columns[i];
      const raw = row[col.id];
      const s = stringifyCell(raw);
      const w = doc.widthOfString(s) + 2 * cellPadding;
      if (w > widths[i]) widths[i] = w;
    }
  }

  // Scale to fit total table width (grow or shrink)
  const total = widths.reduce((a, b) => a + b, 0);
  if (total > 0 && tableWidth > 0) {
    const factor = tableWidth / total;
    for (let i = 0; i < n; i++) widths[i] *= factor;
  }
  return widths;
}

export default exportTablePDF;
