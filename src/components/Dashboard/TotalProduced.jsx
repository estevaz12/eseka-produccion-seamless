import { Skeleton } from '@mui/joy';
import { SparkLineChart } from '@mui/x-charts';
import { dateFormatter } from '../../utils/chartUtils';

export default function TotalProduced({ dataset, loading }) {
  return (
    <Skeleton
      loading={loading}
      variant='rectangle'
      className='rounded-sm size-full'
    >
      <SparkLineChart
        data={dataset.map((row) => row.Docenas)}
        xAxis={{
          data: dataset.map((row) => row.ProdDate),
          valueFormatter: dateFormatter,
        }}
        area
        showTooltip
        showHighlight
      />
    </Skeleton>
  );
}
