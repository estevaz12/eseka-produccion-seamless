import dayjs from 'dayjs';

function dateFormatter(date) {
  return dayjs.tz(date).locale('es').format('ddd DD/MM');
}

export { dateFormatter };
