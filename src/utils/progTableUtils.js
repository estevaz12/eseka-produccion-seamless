function calcAProducir(row) {
  if (row.Tipo === null) return row.Docenas;
  if (row.Tipo === '#') return row.Docenas * 2;
  return row.Docenas / 2;
}

function calcProducido(row) {
  if (row.Tipo === null) return row.Producido / 12 / 1.01;
  if (row.Tipo === '#') return (row.Producido * 2) / 12 / 1.01;
  return row.Producido / 2 / 12 / 1.01;
}

function formatNum(num) {
  if (!num) return num;
  else if (num % 1 < 0.1) return num.toFixed(); // No decimals for whole numbers
  else return num.toFixed(1); // One decimal for non-whole numbers
}
function roundUpEven(num) {
  // round up to nearest even number
  num = Math.ceil(num);
  return num % 2 === 0 ? num : num + 1;
}

export { calcAProducir, calcProducido, formatNum, roundUpEven };
