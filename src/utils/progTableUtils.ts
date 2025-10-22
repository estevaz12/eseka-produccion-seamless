import { ProgColorTable } from '../types';
import localizedNum from './numFormat';

interface PartialProgColor {
  Tipo: string | null;
  Producido: number;
}

type ProgColorData = ProgColorTable | PartialProgColor;

function calcAProducir(row: ProgColorTable) {
  if (row.Tipo === null) return row.Docenas;
  if (row.Tipo === '#') return row.Docenas * 2;
  return row.Docenas / 2;
}

function calcProducido(row: ProgColorData, docena: number, porcExtra: number) {
  if (row.Tipo === null) return row.Producido / docena / porcExtra;
  if (row.Tipo === '#') return (row.Producido * 2) / docena / porcExtra;
  return row.Producido / 2 / docena / porcExtra;
}

function calcFaltaUnidades(row: ProgColorTable) {
  return row.Target - row.Producido;
}

function formatNum(num: number | null): string | null {
  if (typeof num !== 'number' && !num) return num;

  let res: number = num;
  if (num % 1 < 0.1)
    res = Number.parseInt(num.toFixed()); // No decimals for whole numbers
  else res = Number.parseFloat(num.toFixed(1)); // One decimal for non-whole numbers
  return localizedNum(res);
}
function roundUpEven(num: number) {
  // round up to nearest even number
  num = Math.ceil(num);
  return num % 2 === 0 ? num : num + 1;
}

const aProducirStr = (row: ProgColorTable) => {
  const aProducir = formatNum(calcAProducir(row));
  if (row.Tipo === null) {
    return aProducir;
  } else {
    return `${aProducir} (${formatNum(row.Docenas)})`;
  }
};

const colorStr = (row: ProgColorTable) => {
  return `${row.Color} ${
    row.Porcentaje && row.Porcentaje < 100 ? `(${row.Porcentaje}%)` : ''
  }`;
};

const producidoStr = (
  row: ProgColorData,
  docena: number,
  porcExtra: number
) => {
  const producido = formatNum(calcProducido(row, docena, porcExtra));
  return row.Tipo === null
    ? producido
    : `${producido} (${formatNum(row.Producido / docena / porcExtra)})`;
};

const faltaStr = (row: ProgColorTable, docena: number, porcExtra: number) => {
  const falta = formatNum(
    calcAProducir(row) - calcProducido(row, docena, porcExtra)
  );
  const faltaFisico = formatNum(
    row.Docenas - row.Producido / docena / porcExtra
  );
  return row.Tipo == null ? falta : `${falta} (${faltaFisico})`;
};

const footerFormat = (num: number) => {
  return num ? localizedNum(Math.round(num)) : '0';
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
  footerFormat,
};
