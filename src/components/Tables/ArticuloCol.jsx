import { Typography } from '@mui/joy';
import ExpandRowBtn from './ExpandRowBtn.jsx';

export default function ArticuloCol({ row, isOpen, handleRowClick, ...props }) {
  return (
    <td className={`${props.className}`}>
      <Typography
        className='justify-between'
        startDecorator={
          <ExpandRowBtn isOpen={isOpen} handleClick={handleRowClick} />
        }
      >
        <Typography className='min-w-16'>
          {`${row.Articulo}${row.Tipo ? row.Tipo : ''}`}
        </Typography>
      </Typography>
    </td>
  );
}
