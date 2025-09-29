import dayjs from 'dayjs';
import BigNumContent from './BigNumContent.jsx';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import localizedNum from '../../utils/numFormat.js';

export default function RequiredProd({
  progTotal,
  totalProduced,
  workdaysLeft,
  loading,
}) {
  const requiredProd = !workdaysLeft
    ? progTotal - totalProduced
    : Math.ceil((progTotal - totalProduced) / workdaysLeft);

  return (
    <BigNumContent
      loading={loading}
      title='Doc. Diarias Requeridas'
      subtitle={<Subtitle />}
    >
      {localizedNum(requiredProd)} doc.
    </BigNumContent>
  );
}

function Subtitle() {
  return (
    <Stack direction='column' className='gap-2'>
      <Typography level='body-sm'>(sin sábados ni feriados)</Typography>
      <Typography level='body-sm'>
        Para llegar el {dayjs.tz().endOf('month').format('DD/MM')}
      </Typography>
    </Stack>
  );
}
