import { BarChart } from '@mui/x-charts';
import { dateFormatter } from '../../utils/chartUtils';
import ChartContent from './ChartContent.jsx';
import ChartHeader from './ChartHeader.jsx';
import { useMemo } from 'react';

export default function DailyProduction({ dataset, loading }) {
  const dailyAverage = useMemo(() => {
    if (!dataset || dataset.length === 0) return 0;
    const total = dataset.reduce((sum, item) => sum + item.Docenas, 0);
    return Math.round(total / dataset.length);
  }, [dataset]);

  return (
    <ChartContent loading={loading} direction='row' gap={8}>
      <ChartHeader
        title='Producción Diaria'
        value={`${dailyAverage.toLocaleString()} doc.`}
        interval='Promedio por día'
      />
      <BarChart
        loading={loading}
        dataset={dataset}
        borderRadius={8}
        xAxis={[
          {
            dataKey: 'ProdDate',
            scaleType: 'band',
            valueFormatter: dateFormatter,
          },
        ]}
        yAxis={[{ max: 1500 }]}
        // dataKey: for y-axis
        // label: for tooltip
        // valueFormatter: for tooltip
        series={[{ dataKey: 'Docenas', label: 'Docenas' /*valueFormatter*/ }]}
        margin={{ left: 0, right: 0, top: 20, bottom: 0 }}
        grid={{ horizontal: true }}
        slotProps={{ legend: { hidden: true } }}
      />
    </ChartContent>
  );
}
