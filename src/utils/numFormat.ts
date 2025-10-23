const numFormat = new Intl.NumberFormat('es-AR');

export function localizedNum(number: number) {
  return numFormat.format(number);
}
