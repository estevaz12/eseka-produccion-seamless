import Skeleton from '@mui/joy/Skeleton';
import { SparkLineChart } from '@mui/x-charts';
import { useConfig } from '../../ConfigContext.jsx';
import { useEffect, useState } from 'react';
import { dateFormatter } from '../../utils/chartUtils.js';

let apiUrl;
export default function DailyEff() {
  apiUrl = useConfig().apiUrl;
  const [loading, setLoading] = useState(true);
  const [dataset, setDataset] = useState([]);

  useEffect(() => {
    let ignored = false;
    const room = 'SEAMLESS';

    fetch(`${apiUrl}/stats/dailyEfficiency/${room}`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignored) {
          setDataset(data);
          setLoading(false);
        }
      })
      .catch((err) =>
        console.error('[CLIENT] Error fetching /stats/dailyEfficiency:', err)
      );

    return () => {
      ignored = true;
    };
  }, []);

  return (
    <Skeleton
      loading={loading}
      variant='rectangle'
      className='rounded-sm size-full'
    >
      <SparkLineChart
        data={dataset.map((row) => row.WorkEfficiency)}
        xAxis={{
          data: dataset.map((row) => row.ProdDate),
          valueFormatter: dateFormatter,
        }}
        yAxis={{
          valueFormatter: (val) => `${val}%`,
        }}
        area
        showTooltip
        showHighlight
      />
    </Skeleton>
  );
}
