import { Table } from '@mui/joy';

export default function DataTable({ cols, colsWidths = [], children, tfoot }) {
  return (
    <Table
      aria-label='simple table'
      className='**:text-center rounded-md'
      variant='outlined'
      // size='md'
    >
      <thead className='sticky top-0'>
        <tr>
          {cols.filter(Boolean).map((col, i) => (
            <th key={col} className={colsWidths[i]}>
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
      {tfoot && (
        <tfoot className='sticky bottom-0 font-semibold'>
          <tr>
            {tfoot.filter(Boolean).map((foot, i) => (
              <td key={i}>{foot}</td>
            ))}
          </tr>
        </tfoot>
      )}
    </Table>
  );
}
