import ChartHeader from './ChartHeader.jsx';
import ChartContent from './ChartContent.jsx';
import SparkLineOverflow from './SparkLineOverflow.jsx';
import {
  dateFormatter,
  colors,
  getIntervalDates,
} from '../../utils/chartUtils';
import { localizedNum } from '../../utils/numFormat';

export default function TotalProduced({
  dataset,
  totalProduced,
  progress,
  loading,
}) {
  const { monthStart, yesterday } = getIntervalDates();
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
        value={`${localizedNum(totalProduced)} doc.`}
        interval={`Del ${monthStart.format('D/M')} al ${yesterday.format(
          'D/M'
        )}`}
      />
      <SparkLineOverflow
        dataSettings={dataSettings}
        color={progressColor}
        id='produced'
      />
    </ChartContent>
  );
}
