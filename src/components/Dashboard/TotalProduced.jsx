import ChartHeader from './ChartHeader.jsx';
import ChartContent from './ChartContent.jsx';
import SparkLineOverflow from './SparkLineOverflow.jsx';
import { dateFormatter, colors } from '../../utils/chartUtils.js';
import dayjs from 'dayjs';

export default function TotalProduced({
  dataset,
  totalProduced,
  progress,
  loading,
}) {
  const progressColor =
    progress >= 100 ? colors.green : progress > 90 ? colors.yellow : colors.red;

  const data = dataset.map((row) => row.Docenas);
  const dataSettings = {
    data,
    color: progressColor,
    xAxis: {
      data: dataset.map((row) => row.ProdDate),
      valueFormatter: dateFormatter,
    },
    yAxis: { min: Math.min(...data) - 100, max: Math.max(...data) + 100 },
  };

  return (
    <ChartContent loading={loading}>
      <ChartHeader
        title={'Producción Mensual'}
        value={`${totalProduced.toLocaleString()} doc.`}
        interval={`Del ${dayjs.tz().startOf('month').format('D/M')} al ${dayjs
          .tz()
          .subtract(1, 'day')
          .format('D/M')}`}
      />
      <SparkLineOverflow
        dataSettings={dataSettings}
        color={progressColor}
        id='produced'
      />
    </ChartContent>
  );
}
