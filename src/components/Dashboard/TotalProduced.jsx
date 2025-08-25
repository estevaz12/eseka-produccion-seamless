import ChartHeader from './ChartHeader.jsx';
import { useMemo } from 'react';
import ChartContent from './ChartContent.jsx';
import SparkLineOverflow from './SparkLineOverflow.jsx';
import { dateFormatter } from '../../utils/chartUtils.js';
import dayjs from 'dayjs';

export default function TotalProduced({ dataset, loading }) {
  const totalProduced = useMemo(() => {
    return dataset.reduce((acc, row) => acc + row.Docenas, 0);
  }, [dataset]);

  const dataSettings = {
    data: dataset.map((row) => row.Docenas),
    xAxis: {
      data: dataset.map((row) => row.ProdDate),
      valueFormatter: dateFormatter,
    },
    yAxis: { min: 500, max: 1500 },
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
      <SparkLineOverflow dataSettings={dataSettings} />
    </ChartContent>
  );
}
