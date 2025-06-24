import { Table } from '@mui/joy';

export default function DataTable({ cols, children, tfoot }) {
  return (
    <Table aria-label='simple table' className='**:text-center'>
      <thead className='sticky top-0'>
        <tr>
          {cols.filter(Boolean).map((col) => (
            <th key={col}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
      {tfoot && (
        <tfoot className='sticky bottom-0'>
          <tr>
            {tfoot.map((foot, index) => (
              <td key={index}>{foot}</td>
            ))}
          </tr>
        </tfoot>
      )}
    </Table>
  );
}
