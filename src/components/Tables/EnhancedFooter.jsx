import { PrintRounded } from '@mui/icons-material';
import { IconButton } from '@mui/joy';

export default function EnhancedFooter({ footer, selected }) {
  return (
    <tfoot className='sticky bottom-0 z-10 font-semibold'>
      <tr>
        {/* Selected */}
        <td
          colSpan={2}
          className='text-[var(--joy-palette-text-tertiary)] font-normal'
        >
          {selected.length > 0 && `${selected.length} seleccionadas`}
        </td>
        <td className='text-center'>
          {selected.length > 0 && (
            <IconButton variant='soft'>
              <PrintRounded className='text-(--joy-palette-primary-500)' />
            </IconButton>
          )}
        </td>
        {footer.filter(Boolean).map((foot, i) => (
          <td key={i} className='text-right'>
            {foot}
          </td>
        ))}
      </tr>
    </tfoot>
  );
}
