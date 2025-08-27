import dayjs from 'dayjs';
import BigNumContent from './BigNumContent.jsx';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';

export default function DateEstimate({
  totalProduced,
  dailyAverage,
  progTotal,
  holidays,
  loading,
}) {
  const now = dayjs.tz();

  const daysToTarget = !dailyAverage
    ? 0
    : Math.max(0, Math.ceil((progTotal - totalProduced) / dailyAverage) - 1);

  let workdaysToTarget = daysToTarget;
  let current = now.clone();
  for (let i = 0; i < daysToTarget; i++) {
    const day = current.day(); // 0: Sunday, 1: Monday, ..., 6: Saturday
    const currFmt = current.format('YYYY-MM-DD');
    const isHoliday = holidays.includes(currFmt);
    // add one extra day if it is not a working day
    if (day === 0 || day === 6 || isHoliday) workdaysToTarget++;
    current = current.add(1, 'day');
  }

  const targetDate = now.add(workdaysToTarget, 'day');
  // Ensure targetDate is a workday (not weekend or holiday)
  let adjustedTargetDate = targetDate.clone();
  while (
    adjustedTargetDate.day() === 0 || // Sunday
    adjustedTargetDate.day() === 6 || // Saturday
    holidays.includes(adjustedTargetDate.format('YYYY-MM-DD'))
  ) {
    adjustedTargetDate = adjustedTargetDate.add(1, 'day');
  }

  return (
    <BigNumContent
      loading={loading}
      title='Fecha Est. a la Programada'
      subtitle={<Subtitle dailyAverage={dailyAverage} />}
    >
      {adjustedTargetDate.locale('es').format('ddd DD/MM')}
    </BigNumContent>
  );
}

function Subtitle({ dailyAverage }) {
  return (
    <Stack direction='column' className='gap-2'>
      <Typography level='body-sm'>(sin sábados ni feriados)</Typography>
      <Typography level='body-sm'>
        Produciendo {dailyAverage.toLocaleString()} doc. por día
      </Typography>
    </Stack>
  );
}
