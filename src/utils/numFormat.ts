const numFormat = new Intl.NumberFormat('es-AR');

export default function localizedNum(number: number) {
  return numFormat.format(number);
}
