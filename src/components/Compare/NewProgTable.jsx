import DataTable from '../Tables/DataTable.jsx';
import ProgRow from './ProgRow.jsx';

export default function NewProgTable({ programada }) {
  return (
    <DataTable cols={['Artículo', 'Talle', 'A Producir']}>
      {programada.rows.map((row, i) => (
        <ProgRow key={i} row={row} />
      ))}
    </DataTable>
  );
}
