import { Typography } from '@mui/joy';
import EditArtBtn from './EditArtBtn.jsx';
import ExpandRowBtn from './ExpandRowBtn.jsx';

export default function ArticuloCol({
  row,
  handleRowClick,
  editable,
  rowColor = '',
}) {
  return (
    <td className='relative group/art'>
      <Typography
        {...(editable && {
          startDecorator: (
            <ExpandRowBtn handleClick={handleRowClick} rowColor={rowColor} />
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
              handleClick={handleRowClick}
              rowColor={rowColor}
              className='absolute -left-1'
            />
            {`${row.Articulo}${row.Tipo ? row.Tipo : ''}`}
          </>
        )}
      </Typography>
    </td>
  );
}
