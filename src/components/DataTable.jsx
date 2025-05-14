import { Table } from '@mui/joy';

export default function DataTable({ cols, children }) {
  return (
    <Table aria-label='simple table' className='**:text-center'>
      <thead>
        <tr>
          {cols.map((col) => (
            <th key={col}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </Table>
  );
}
