import BigNumContent from './BigNumContent.jsx';
import dayjs from 'dayjs';
import LinearProgress from '@mui/joy/LinearProgress';
import { Box, Stack, Typography } from '@mui/joy';

export default function TotalEstimate({
  estimate,
  progTotal,
  progress,
  loading,
}) {
  return (
    <BigNumContent
      loading={loading}
      title='Producción Total Estimada'
      subtitle={<Subtitle target={progTotal} progress={progress} />}
    >
      {estimate.toLocaleString()} doc.
    </BigNumContent>
  );
}

function Subtitle({ target, progress }) {
  const monthEnd = dayjs.tz().endOf('month');
  const progressColor =
    progress >= 100
      ? 'text-chart-green'
      : progress > 95
      ? 'text-chart-yellow'
      : 'text-chart-red';

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
              color='neutral'
              className={progressColor}
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
