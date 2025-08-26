import BigNumContent from './BigNumContent.jsx';
import dayjs from 'dayjs';
import LinearProgress from '@mui/joy/LinearProgress';
import { Box, Stack, Typography } from '@mui/joy';

export default function TotalEstimate({
  totalProduced,
  dailyAverage,
  progTotal,
  workdaysLeft,
  loading,
}) {
  const estimate = totalProduced + dailyAverage * workdaysLeft;

  return (
    <BigNumContent
      loading={loading}
      title='Producción Total Estimada'
      subtitle={<Subtitle estimate={estimate} target={progTotal} />}
    >
      {estimate.toLocaleString()} doc.
    </BigNumContent>
  );
}

function Subtitle({ estimate, target }) {
  const monthEnd = dayjs.tz().endOf('month');
  const progress = target === 0 ? 0 : Math.round((estimate / target) * 100);

  return (
    <Stack direction='column' className='gap-2'>
      <Stack direction='column'>
        <Typography level='body-sm'>
          Para el {monthEnd.format('DD/MM')}
        </Typography>
        <Typography level='body-sm'>(sin sábados ni feriados)</Typography>
      </Stack>

      <Stack direction='column' className='gap-1'>
        <Stack direction='row' className='items-center justify-center gap-2'>
          <Box className='w-2/3'>
            <LinearProgress
              determinate
              value={progress > 100 ? 100 : progress}
              size='lg'
              variant='solid'
            />
          </Box>
          <Typography level='body-sm'>{progress}%</Typography>
        </Stack>

        <Typography level='body-sm'>
          de {target.toLocaleString()} doc. programadas
        </Typography>
      </Stack>
    </Stack>
  );
}
