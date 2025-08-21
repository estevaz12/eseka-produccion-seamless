import Skeleton from '@mui/joy/Skeleton';
import { BarChart } from '@mui/x-charts';
import { dateFormatter } from '../../utils/chartUtils';

export default function DailyProduction({ dataset, loading }) {
  return (
    <Skeleton
      loading={loading}
      variant='rectangle'
      className='rounded-sm size-full'
    >
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
        // dataKey: for y-axis
        // label: for tooltip
        // valueFormatter: for tooltip
        series={[{ dataKey: 'Docenas', label: 'Docenas' /*valueFormatter*/ }]}
        margin={{ left: 0, right: 0, top: 20, bottom: 0 }}
        grid={{ horizontal: true }}
        slotProps={{ legend: { hidden: true } }}
      />
    </Skeleton>
  );
}
