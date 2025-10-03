import dayjs from 'dayjs';
import BigNumContent from './BigNumContent.jsx';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import localizedNum from '../../utils/numFormat.js';

export default function DateEstimate({
  totalProduced,
  dailyAverage,
  progTotal,
  holidays,
  loading,
}) {
  // includes today
  const daysToTarget = !dailyAverage
    ? 0
    : Math.max(0, Math.ceil((progTotal - totalProduced) / dailyAverage));

  let workdayCount = 0;
  let current = dayjs.tz().hour(6).minute(0).second(0);
  while (workdayCount < daysToTarget) {
    const day = current.day(); // 0: Sunday, 1: Monday, ..., 6: Saturday
    const currFmt = current.format('YYYY-MM-DD');
    const isHoliday = holidays.includes(currFmt);
    const isWorkday = day !== 0 && day !== 6 && !isHoliday;
    if (isWorkday) workdayCount++;
    if (workdayCount < daysToTarget) current = current.add(1, 'day');
  }

  const adjustedTargetDate = current;

  return (
    <BigNumContent
      loading={loading}
      title='Fecha Est. a la Programada'
      subtitle={<Subtitle dailyAverage={dailyAverage} />}
    >
      {progTotal === 0
        ? '...'
        : adjustedTargetDate.locale('es').format('ddd DD/MM')}
    </BigNumContent>
  );
}

function Subtitle({ dailyAverage }) {
  return (
    <Stack direction='column' className='gap-2'>
      <Typography level='body-sm'>(sin sábados ni feriados)</Typography>
      <Typography level='body-sm'>
        Produciendo {localizedNum(dailyAverage)} doc. por día
      </Typography>
    </Stack>
  );
}
