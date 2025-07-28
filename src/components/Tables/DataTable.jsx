import { Table, Typography } from '@mui/joy';

export default function DataTable({
  cols,
  colsWidths = [],
  children,
  tfoot,
  className = '',
  titleHeader = undefined,
  titleHeaderColor = 'bg-[var(--joy-palette-primary-softBg)]',
  headerTop = '',
  stripe = 'even',
}) {
  const stripeClass =
    stripe !== ''
      ? '[&_tbody_tr:nth-of-type(even)]:bg-[var(--joy-palette-background-level1)]'
      : '';

  return (
    <Table
      aria-label='simple table'
      stripe={stripe}
      stickyHeader
      stickyFooter
      className={`**:text-center rounded-md ${className} ${stripeClass}`}
      variant='outlined'
      hoverRow
      sx={{
        '--TableRow-stripeBackground': (theme) =>
          theme.vars.palette.background.level1,
      }}
      // size='md'
    >
      <thead className={`sticky ${headerTop}`}>
        {titleHeader && (
          <tr>
            <th colSpan={cols.length} className={titleHeaderColor}>
              <Typography level='title-md' className='font-semibold'>
                {titleHeader}
              </Typography>
            </th>
          </tr>
        )}
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
