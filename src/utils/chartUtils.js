import dayjs from 'dayjs';

function dateFormatter(date, context) {
  const dateObj = dayjs.tz(date).locale('es');
  return context.location === 'tick'
    ? dateObj.format('DD/MM')
    : dateObj.format('ddd DD/MM');
}

const colors = {
  green: '#87cc3e',
  yellow: '#ffc000',
  red: '#ed3140',
  gray: '#decccc',
};

export { dateFormatter, colors };
