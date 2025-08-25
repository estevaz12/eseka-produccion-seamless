import { useMemo } from 'react';
import BigNumContent from './BigNumContent.jsx';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import LinearProgress from '@mui/joy/LinearProgress';
import { Box, Stack, Typography } from '@mui/joy';

dayjs.extend(isSameOrBefore);

export default function TotalEstimate({
  dataset,
  progTotal,
  holidays,
  loading,
}) {
  const totalProduced = useMemo(() => {
    return dataset.reduce((acc, row) => acc + row.Docenas, 0);
  }, [dataset]);

  const dailyAverage = useMemo(() => {
    if (!dataset || dataset.length === 0) return 0;
    const total = dataset.reduce((sum, item) => sum + item.Docenas, 0);
    return Math.round(total / dataset.length);
  }, [dataset]);

  const now = dayjs.tz();
  const monthEnd = dayjs.tz().endOf('month');
  // Count non-holiday weekdays left including today
  let weekdaysLeft = 0;
  let current = now.clone();
  while (current.isSameOrBefore(monthEnd, 'day')) {
    const day = current.day(); // 0: Sunday, 1: Monday, ..., 6: Saturday
    const currFmt = current.format('YYYY-MM-DD');
    const isHoliday = holidays.includes(currFmt);
    if (day >= 1 && day <= 5 && !isHoliday) weekdaysLeft++;
    current = current.add(1, 'day');
  }

  const estimate = totalProduced + dailyAverage * weekdaysLeft;

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
