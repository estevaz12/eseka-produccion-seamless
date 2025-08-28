import { useConfig } from '../../ConfigContext.jsx';
import { useEffect, useMemo, useState } from 'react';
import { dateFormatter, colors } from '../../utils/chartUtils.js';
import ChartContent from './ChartContent.jsx';
import ChartHeader from './ChartHeader.jsx';
import SparkLineOverflow from './SparkLineOverflow.jsx';
import dayjs from 'dayjs';

let apiUrl;
export default function DailyEff({ setYesterdayEff }) {
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
          setYesterdayEff(data[data.length - 1]);
        }
      })
      .catch((err) =>
        console.error('[CLIENT] Error fetching /stats/dailyEfficiency:', err)
      );

    return () => {
      ignored = true;
    };
  }, []);

  const avgEff = useMemo(() => {
    if (dataset.length === 0) return 0;
    const total = dataset.reduce((acc, row) => acc + row.WorkEfficiency, 0);
    return Math.round(total / dataset.length);
  }, [dataset]);

  const effColor =
    avgEff >= 80 ? colors.green : avgEff >= 75 ? colors.yellow : colors.red;

  const data = dataset.map((row) => row.WorkEfficiency);
  const dataSettings = {
    data,
    color: effColor,
    xAxis: {
      data: dataset.map((row) => row.ProdDate),
      valueFormatter: dateFormatter,
    },
    yAxis: { min: Math.min(...data) - 5, max: Math.max(...data) + 5 },
  };

  return (
    <ChartContent loading={loading}>
      <ChartHeader
        title='Eficiencia Promedio'
        value={`${avgEff}%`}
        interval={`Del ${dayjs.tz().startOf('month').format('D/M')} al ${dayjs
          .tz()
          .subtract(1, 'day')
          .format('D/M')}`}
      />
      <SparkLineOverflow
        dataSettings={dataSettings}
        color={effColor}
        id='eff'
      />
    </ChartContent>
  );
}
