import Skeleton from '@mui/joy/Skeleton';
import { BarChart } from '@mui/x-charts';
import { useEffect, useState } from 'react';
import { useConfig } from '../../ConfigContext.jsx';

let apiUrl;
export default function CurrentEff() {
  apiUrl = useConfig().apiUrl;
  const [loading, setLoading] = useState(true);
  const [dataset, setDataset] = useState([]);

  useEffect(() => {
    let ignored = false;
    let interval;
    const room = 'SEAMLESS';

    fetchEff();
    // fetch every 30 seconds
    interval = setInterval(fetchEff, 30000);

    return () => {
      ignored = true;
      clearInterval(interval);
    };

    function fetchEff() {
      fetch(`${apiUrl}/stats/currentEfficiency/${room}`)
        .then((res) => res.json())
        .then((data) => {
          if (!ignored) {
            setDataset(data);
            setLoading(false);
          }
        })
        .catch((err) =>
          console.error('[CLIENT] Error fetching /stats/currentEff:', err)
        );
    }
  }, []);

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
        xAxis={[{ dataKey: 'GroupCode', scaleType: 'band' }]}
        yAxis={[
          {
            width: 60,
            valueFormatter: (value) => `${value}%`,
            max: 100,
            scaleType: 'linear',
            tickInterval: [0, 25, 40, 55, 70, 85, 100],
          },
        ]}
        // dataKey: for y-axis
        // label: for tooltip
        // valueFormatter: for tooltip
        series={[
          {
            dataKey: 'GroupEff',
            label: 'Efficiencia',
            valueFormatter: (value) => `${value}%`,
          },
        ]}
        margin={{ left: 0, right: 0, top: 20, bottom: 0 }}
        grid={{ horizontal: true }}
        slotProps={{ legend: { hidden: true } }}
      />
    </Skeleton>
  );
}
