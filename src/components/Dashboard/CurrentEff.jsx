import { BarChart } from '@mui/x-charts';
import { useEffect, useState } from 'react';
import { useConfig } from '../../ConfigContext.jsx';
import ChartContent from './ChartContent.jsx';
import ChartHeader from './ChartHeader.jsx';

let apiUrl;
export default function CurrentEff() {
  apiUrl = useConfig().apiUrl;
  const [loading, setLoading] = useState(true);
  const [dataset, setDataset] = useState({ total: 0, groups: [] });

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
    <ChartContent loading={loading} direction='row' gap={8}>
      <ChartHeader
        title='Eficiencia Actual'
        value={`${dataset.total}%`}
        interval={'Total'}
      />
      <BarChart
        loading={loading}
        dataset={dataset.groups}
        borderRadius={8}
        xAxis={[{ dataKey: 'GroupCode', scaleType: 'band' }]}
        yAxis={[
          {
            valueFormatter: (value) => `${value}%`,
            min: 25,
            max: 100,
            scaleType: 'linear',
            tickInterval: [0, 50, 60, 70, 85, 100],
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
    </ChartContent>
  );
}
