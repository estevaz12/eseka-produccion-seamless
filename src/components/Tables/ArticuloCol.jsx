import { Typography } from '@mui/joy';
import ExpandRowBtn from './ExpandRowBtn.jsx';

export default function ArticuloCol({ row, isOpen, handleRowClick, ...props }) {
  return (
    <td className={`text-right ${props.className}`}>
      <Typography
        startDecorator={
          <ExpandRowBtn isOpen={isOpen} handleClick={handleRowClick} />
        }
      >
        <Typography className='grow'>
          {`${row.Articulo}${row.Tipo ? row.Tipo : ''}`}
        </Typography>
      </Typography>
    </td>
  );
}
