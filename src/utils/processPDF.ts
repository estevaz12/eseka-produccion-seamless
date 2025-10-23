import { Item, PdfReader, TableParser } from 'pdfreader';
import type { PDFProgRow } from '../types';

interface PDFData {
  total: number;
  rows: PDFProgRow[];
}

const processPDF = async (path: string) => {
  return new Promise((resolve, reject) => {
    const data: PDFData = { total: 0, rows: [] };
    // Create a TableParser instance (to store extracted rows)
    var table = new TableParser();
    // Minimum `y` coordinate for filtering out metadata
    // Text items above this value are ignored.
    const minY = 5.5;

    /**
     * Read the PDF and extract table data.
     *
     * Steps:
     * 1️⃣ Parse the PDF file.
     * 2️⃣ Process text items (excluding metadata using `minY`).
     * 3️⃣ Assign each text item to the correct column.
     * 4️⃣ Print the table when a page ends.
     */
    new PdfReader().parseFileItems(path, function (err, item) {
      if (err) reject(err);
      else if (!item || item.page) {
        // End of file or page → Print the table matrix.
        // printTable(table);

        // Loop through data for json data
        table.getMatrix().forEach((row) => {
          let articulo =
            row[0]
              ?.map((cell) => cell.text)
              .join('')
              .trim() || '';
          // Skip header/footer/totals rows
          if (
            articulo !== '' &&
            articulo.toLowerCase() !== 'articulo' &&
            articulo.toLowerCase() !== 'totales' &&
            !isNaN(parseFloat(articulo.replace(',', '.')))
          ) {
            articulo = articulo.replace(',', '.');
            // const desc =
            //   row[1]
            //     .map((cell) => cell.text)
            //     .join('')
            //     .trim();
            const talle = row[2]
              .map((cell) => cell.text)
              .join('')
              .trim();
            const aProducir = row[3]
              .map((cell) => cell.text)
              .join('')
              .trim();
            // const producido = row[4]
            //   .map((cell) => cell.text)
            //   .join('')
            //   .trim();
            // const falta = row[5]
            //   .map((cell) => cell.text)
            //   .join('')
            //   .trim();

            data.rows.push({
              articulo: parseFloat(articulo),
              // desc,
              talle: parseInt(talle),
              aProducir: parseInt(aProducir),
              // producido,
              // falta,
            });

            data.total += parseInt(aProducir);
          }
        });

        // console.log(JSON.stringify(data, null, 2));
        // Reset TableParser for the next page (for multi-page PDFs).
        table = new TableParser();
        // If `item` is `null`, we are at the end of the PDF → resolve the Promise
        if (!item) resolve(data);
      } else if (item.text) {
        // Only process text that is part of the table (skip metadata).
        const it: any = item;
        if (it.text && parseFloat(String(it.y)) >= minY) {
          table.processItem(it, columnQuantitizer(it));
        }
      }
    });
  });
};

// processPDF().then((data) => console.log(JSON.stringify(data, null, 2)));
export default processPDF;

/**
 * Determines which column a text item belongs to,
 * based on its x-coordinate.
 *
 * PDFs store text items at different x/y positions, so this
 * function groups items correctly into column slots.
 *
 * Adjust thresholds based on the actual PDF layout.
 */
const columnQuantitizer = (item) => {
  const x = parseFloat(item.x);
  if (x <= 7) return 0; // Articulo
  if (x > 7 && x <= 14) return 1; // Descripcion
  if (x > 14 && x <= 21) return 2; // Talle
  if (x > 21 && x <= 28) return 3; // A Producir
  if (x > 28 && x <= 34) return 4; // Producida
  return 5; // Falta
};

const printTable = (table: TableParser) => {
  // Define table dimensions (6 columns)
  const nCols = 6;

  // Padding per cell for formatting output
  const cellPadding = 10;

  console.log(renderMatrix(table.getMatrix(), nCols, cellPadding));
};

// Formats the final table matrix for printing.
const renderMatrix = (matrix: Item[][][], nCols: number, cellPadding: number) =>
  (matrix || [])
    .map(
      (row, y) =>
        '| ' +
        padColumns(row, nCols)
          .map(mergeCells)
          .map((cell) => formatMergedCell(cell, cellPadding))
          .join(' | ') +
        ' |'
    )
    .join('\n');

// Ensures each row has exactly `nCols` columns.
const padColumns = (array: Item[][], nb: number): Item[][] =>
  Array.from({ length: nb }, (_, i) => array[i] || []);

// Combines fragmented text items into a complete entry.
const mergeCells = (cells: { text?: string }[]) =>
  (cells || []).map((cell) => cell.text ?? '').join('');

// Pads each cell for neat alignment.
const formatMergedCell = (mergedCell: string, cellPadding: number) => {
  // Polyfill for `padEnd()` if not available (older JS versions)
  if (!String.prototype.padEnd) {
    String.prototype.padEnd = function padEnd(targetLength, padString) {
      targetLength = targetLength >> 0; // Floor number conversion
      padString = String(padString || ' ');
      if (this.length > targetLength) return String(this);

      targetLength = targetLength - this.length;
      if (targetLength > padString.length) {
        padString += padString.repeat(targetLength / padString.length);
      }
      return String(this) + padString.slice(0, targetLength);
    };
  }

  return mergedCell.substr(0, cellPadding).padEnd(cellPadding, ' ');
};
