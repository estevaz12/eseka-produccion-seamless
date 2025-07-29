import { PrintRounded } from '@mui/icons-material';

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
        <td>{selected.length > 0 && <PrintRounded />}</td>
        {footer.filter(Boolean).map((foot, i) => (
          <td key={i}>{foot}</td>
        ))}
      </tr>
    </tfoot>
  );
}
