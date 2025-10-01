import Box from '@mui/joy/Box';
import Stack from '@mui/joy/Stack';
import DataTable from '../Tables/DataTable.jsx';
import ProgRow from './ProgRow.jsx';

export default function DiffTable({ diff }) {
  const maxLen = Math.max(
    diff.added.length,
    diff.modified.length,
    diff.deleted.length
  );

  const pad = (arr) => {
    if (arr.length < maxLen) {
      return arr.concat(
        Array.from({ length: maxLen - arr.length }, () => ({
          articulo: '',
          talle: '',
          aProducir: '',
        }))
      );
    } else {
      return arr;
    }
  };

  const added = pad(diff.added);
  const modified = pad(diff.modified);
  const deleted = pad(diff.deleted);

  return (
    <Stack direction='row' className='items-start justify-between gap-4'>
      <Box className='overflow-auto max-h-[430px]'>
        <DataTable
          cols={['Artículo', 'Talle', 'A Producir']}
          titleHeader='Agregado'
          titleHeaderColor='bg-[var(--joy-palette-success-softBg)]'
        >
          {added.map((row, i) => (
            <ProgRow key={i} row={row} />
          ))}
        </DataTable>
      </Box>

      <Box className='overflow-auto max-h-[430px]'>
        <DataTable
          cols={['Articulo', 'Talle', 'A Producir']}
          titleHeader='Modificado'
          titleHeaderColor='bg-[var(--joy-palette-warning-softBg)]'
        >
          {modified.map((row, i) => (
            <ProgRow key={i} row={row} />
          ))}
        </DataTable>
      </Box>

      <Box className='overflow-auto max-h-[430px]'>
        <DataTable
          cols={['Articulo', 'Talle', 'A Producir']}
          titleHeader='Eliminado'
          titleHeaderColor='bg-[var(--joy-palette-danger-softBg)]'
        >
          {deleted.map((row, i) => (
            <ProgRow key={i} row={row} />
          ))}
        </DataTable>
      </Box>
    </Stack>
  );
}
