import { BarChart } from '@mui/x-charts';
import { dateFormatter } from '../../utils/chartUtils';
import ChartContent from './ChartContent.jsx';
import ChartHeader from './ChartHeader.jsx';

export default function DailyProduction({ dataset, dailyAverage, loading }) {
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
