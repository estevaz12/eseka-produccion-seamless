export default function ProgRow({ row, i }) {
  return (
    <tr key={i}>
      <td>{row.articulo}</td>
      <td>{row.talle}</td>
      <td>{row.aProducir}</td>
    </tr>
  );
}
