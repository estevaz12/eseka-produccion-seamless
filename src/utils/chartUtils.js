import dayjs from 'dayjs';

const colors = {
  green: '#87cc3e',
  yellow: '#ffc000',
  red: '#ed3140',
  gray: '#decccc',
};

function dateFormatter(date, context) {
  const dateObj = !date ? dayjs.tz() : dayjs.tz(date);
  const dateLoc = dateObj.locale('es');
  return context.location === 'tick'
    ? dateLoc.format('DD/MM')
    : dateLoc.format('ddd DD/MM');
}

function getIntervalDates() {
  const monthStart = dayjs.tz().startOf('month');
  let yesterday = dayjs.tz().subtract(1, 'day');

  if (yesterday < monthStart) yesterday = monthStart;
  return { monthStart, yesterday };
}

export { dateFormatter, colors, getIntervalDates };
