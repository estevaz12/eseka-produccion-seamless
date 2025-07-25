import { Checkbox, Table } from '@mui/joy';
import EnhancedTableHead from './EnhancedTableHead.jsx';
import { useMemo, useState } from 'react';

// FIXME: sorting

/**
 * SortedSelectedTable
 * Renders a table with sortable columns and selectable rows.
 */
export default function DataTable({
  cols,
  rows,
  renderRow,
  initOrder,
  initOrderBy,
  tfoot,
  selectable = true,
  stripe = 'even',
  titleHeader = undefined,
  titleHeaderColor = 'bg-[var(--joy-palette-primary-softBg)]',
  className = '',
  headerTop = '',
  checkboxVariant = 'outlined',
}) {
  // State for current sort order ('asc' or 'desc')
  const [order, setOrder] = useState(initOrder);
  // State for current column to sort by
  const [orderBy, setOrderBy] = useState(initOrderBy);
  // State for currently selected rows
  const [selected, setSelected] = useState([]);

  const stripeClass =
    stripe !== ''
      ? '[&_tbody_tr:nth-of-type(even)]:bg-[var(--joy-palette-background-level1)]'
      : '';

  const sortedRows = useMemo(() => {
    if (order !== initOrder || orderBy !== initOrderBy) {
      return [...rows].sort(getComparator(order, orderBy, cols));
    }

    return rows;
  }, [rows, order, orderBy, initOrder, initOrderBy, cols]);

  /**
   * Handles sorting when a column header is clicked.
   * If the same column is clicked, toggles between ascending and descending.
   * @param {Event} event - The click event.
   * @param {string} property - The column property to sort by.
   */
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  /**
   * Handles the "select all" checkbox in the table header.
   * Selects all rows if checked, or clears selection if unchecked.
   * @param {Event} event - The change event from the checkbox.
   */
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      // Select all rows
      const newSelected = rows.map((row) => row);
      setSelected(newSelected);
      return;
    }
    // Deselect all
    setSelected([]);
  };

  /**
   * Handles clicking on a row to select or deselect it.
   * Adds or removes the row from the selected array.
   * @param {Event} event - The click event.
   * @param {Object} row - The row object.
   */
  const handleClick = (event, row) => {
    const selectedIndex = selected.indexOf(row);
    let newSelected = [];
    if (selectedIndex === -1) {
      // Not selected yet, add to selection
      newSelected = newSelected.concat(selected, row);
    } else if (selectedIndex === 0) {
      // First item, remove it
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      // Last item, remove it
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      // Middle item, remove it
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  return (
    <Table
      aria-label='simple table'
      stripe={stripe}
      stickyHeader
      stickyFooter
      variant='outlined'
      hoverRow
      className={`**:text-center rounded-md ${className} ${stripeClass}`}
      sx={{
        '--TableCell-selectedBackground': (theme) =>
          theme.vars.palette.primary.softHoverBg,
      }}
    >
      {/* Table header with sorting and select-all functionality */}
      <EnhancedTableHead
        cols={cols}
        order={order}
        orderBy={orderBy}
        selectable={selectable}
        numSelected={selected.length}
        onSelectAllClick={handleSelectAllClick}
        onRequestSort={handleRequestSort}
        rowCount={rows.length}
        headerTop={headerTop}
        titleHeader={titleHeader}
        titleHeaderColor={titleHeaderColor}
      />

      <tbody>
        {/* Sort rows before rendering */}
        {sortedRows.map((row, i) => {
          const isItemSelected = selected.includes(row);
          const [rowClassName, renderedRow] = renderRow(row, i);

          return (
            <tr
              key={i}
              className={rowClassName}
              // Apply custom background if selected
              style={
                isItemSelected
                  ? {
                      '--TableCell-dataBackground':
                        'var(--TableCell-selectedBackground)',
                      '--TableCell-headBackground':
                        'var(--TableCell-selectedBackground)',
                    }
                  : {}
              }
            >
              {/* Selection checkbox for the row */}
              {selectable && (
                <td
                  role='checkbox'
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  className='w-10'
                  onClick={(event) => handleClick(event, row)}
                >
                  <Checkbox
                    checked={isItemSelected}
                    variant={isItemSelected ? 'solid' : checkboxVariant}
                    sx={{ verticalAlign: 'top' }}
                  />
                </td>
              )}

              {/* Row data cells */}
              {renderedRow}
            </tr>
          );
        })}
      </tbody>

      {tfoot && (
        <tfoot className='sticky bottom-0 z-10 font-semibold'>
          <tr>
            {/* Selected */}
            <td
              colSpan={2}
              className='text-[var(--joy-palette-text-tertiary)] font-normal'
            >
              {selected.length > 0 ? `${selected.length} seleccionadas` : ''}
            </td>
            {tfoot.filter(Boolean).map((foot, i) => (
              <td key={i}>{foot}</td>
            ))}
          </tr>
        </tfoot>
      )}
    </Table>
  );
}

/**
 * getComparator
 * Returns a comparator function for sorting based on order and property.
 * @param {'asc'|'desc'} order - Sort order.
 * @param {string} orderBy - Property to sort by.
 * @returns {Function} Comparator function.
 */
function getComparator(order, orderBy, cols) {
  const col = cols.find((c) => c.id === orderBy); // get the column
  const sortFn = col && col.sortFn; // get the sort function
  return (a, b) => {
    let comparator;
    if (sortFn) {
      comparator = sortFn(a, b, order);
    } else {
      comparator = descendingComparator(a, b, orderBy);
    }
    return order === 'desc' ? comparator : -comparator;
  };
}

/**
 * descendingComparator
 * Compares two objects for descending order based on a property.
 * @param {Object} a - First object.
 * @param {Object} b - Second object.
 * @param {string} orderBy - Property to compare.
 * @returns {number} -1 if b < a, 1 if b > a, 0 if equal.
 */
function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}
