import { Typography } from '@mui/joy';
import EditArtBtn from './EditArtBtn.jsx';
import ExpandRowBtn from './ExpandRowBtn.jsx';

export default function ArticuloCol({ row, isOpen, handleRowClick, editable }) {
  return (
    <td className='relative group/art'>
      <Typography
        {...(editable && {
          startDecorator: (
            <ExpandRowBtn isOpen={isOpen} handleClick={handleRowClick} />
          ),
          endDecorator: <EditArtBtn articulo={row.Articulo} tipo={row.Tipo} />,
        })}
        className={!editable && 'relative'}
      >
        {editable ? (
          <Typography className='grow'>
            {`${row.Articulo}${row.Tipo ? row.Tipo : ''}`}
          </Typography>
        ) : (
          <>
            <ExpandRowBtn
              isOpen={isOpen}
              handleClick={handleRowClick}
              className='absolute -left-1'
            />
            {`${row.Articulo}${row.Tipo ? row.Tipo : ''}`}
          </>
        )}
      </Typography>
    </td>
  );
}
