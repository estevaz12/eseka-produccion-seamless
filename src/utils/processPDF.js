import { PdfReader, TableParser } from 'pdfreader';
const filename = './src/assets/programada.pdf';
const nbCols = 6;
const cellPadding = 10;
const columnQuantitizer = (item) => {
  const x = parseFloat(item.x);
  if (x <= 7) return 0;
  if (x > 7 && x <= 14) return 1;
  if (x > 14 && x <= 21) return 2;
  if (x > 21 && x <= 28) return 3;
  if (x > 28 && x <= 34) return 4;
  return 5;
};

// polyfill for String.prototype.padEnd()
// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/repeat
if (!String.prototype.padEnd) {
  String.prototype.padEnd = function padEnd(targetLength, padString) {
    targetLength = targetLength >> 0; //floor if number or convert non-number to 0;
    padString = String(padString || ' ');
    if (this.length > targetLength) {
      return String(this);
    } else {
      targetLength = targetLength - this.length;
      if (targetLength > padString.length) {
        padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
      }
      return String(this) + padString.slice(0, targetLength);
    }
  };
}

const padColumns = (array, nb) =>
  Array.apply(null, { length: nb }).map((val, i) => array[i] || []);

const mergeCells = (cells) => (cells || []).map((cell) => cell.text).join('');

const formatMergedCell = (mergedCell) =>
  mergedCell.substr(0, cellPadding).padEnd(cellPadding, ' ');

const renderMatrix = (matrix) =>
  (matrix || [])
    .map(
      (row, y) =>
        '| ' +
        padColumns(row, nbCols)
          .map(mergeCells)
          .map(formatMergedCell)
          .join(' | ') +
        ' |'
    )
    .join('\n');

var table = new TableParser();
const minY = 5.5;
new PdfReader().parseFileItems(filename, function (err, item) {
  if (err) console.error(err);
  else if (!item || item.page) {
    // end of file, or page
    console.log(renderMatrix(table.getMatrix()));
    // item?.page && console.log('PAGE:', item.page);
    table = new TableParser(); // new/clear table for next page
  } else if (item.text) {
    if (item.text && parseFloat(item.y) >= minY) {
      table.processItem(item, columnQuantitizer(item));
    }
  }
});
