function calcAProducir(row) {
  if (row.Tipo === null) return row.Docenas;
  if (row.Tipo === '#') return row.Docenas * 2;
  return row.Docenas / 2;
}

function calcProducido(row, docena, porcExtra) {
  if (row.Tipo === null) return row.Producido / docena / porcExtra;
  if (row.Tipo === '#') return (row.Producido * 2) / docena / porcExtra;
  return row.Producido / 2 / docena / porcExtra;
}

function calcFaltaUnidades(row) {
  return row.Target - row.Producido;
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

const aProducirStr = (row) => {
  const aProducir = formatNum(calcAProducir(row));
  if (row.Tipo === null) {
    return aProducir;
  } else {
    return `${aProducir} (${row.Docenas})`;
  }
};

const colorStr = (row) => {
  return `${row.Color} ${
    row.Porcentaje && row.Porcentaje < 100 ? `(${row.Porcentaje}%)` : ''
  }`;
};

const producidoStr = (row, docena, porcExtra) => {
  const producido = formatNum(calcProducido(row, docena, porcExtra));
  return row.Tipo === null
    ? producido
    : `${producido} (${formatNum(row.Producido / docena / porcExtra)})`;
};

const faltaStr = (row, docena, porcExtra) => {
  const falta = formatNum(
    calcAProducir(row) - calcProducido(row, docena, porcExtra)
  );
  const faltaFisico = formatNum(
    row.Docenas - row.Producido / docena / porcExtra
  );
  return row.Tipo == null ? falta : `${falta} (${faltaFisico})`;
};

export {
  calcAProducir,
  calcProducido,
  calcFaltaUnidades,
  formatNum,
  roundUpEven,
  aProducirStr,
  colorStr,
  producidoStr,
  faltaStr,
};
