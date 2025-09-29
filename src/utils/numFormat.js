const numFormat = new Intl.NumberFormat('es-AR');

export default function localizedNum(number) {
  return numFormat.format(number);
}
