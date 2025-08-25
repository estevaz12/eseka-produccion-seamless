import dayjs from 'dayjs';

function dateFormatter(date, context) {
  const dateObj = dayjs.tz(date).locale('es');
  return context.location === 'tick'
    ? dateObj.format('DD/MM')
    : dateObj.format('ddd DD/MM');
}

export { dateFormatter };
