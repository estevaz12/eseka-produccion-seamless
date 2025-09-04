import { BarChart } from '@mui/x-charts';
import { dateFormatter, colors } from '../../utils/chartUtils';
import ChartContent from './ChartContent.jsx';
import ChartHeader from './ChartHeader.jsx';
import Divider from '@mui/joy/Divider';
import dayjs from 'dayjs';
import Stack from '@mui/joy/Stack';
import { useOutletContext } from 'react-router';

export default function DailyProduction({ dataset, dailyAverage, loading }) {
  const { room } = useOutletContext();
  // will be {Docenas: null, ProdDate: null} if no data
  const yesterdayProd = dataset[dataset.length - 1];

  return (
    <ChartContent loading={loading} direction='row' gap={8}>
      <Stack direction='column' className='justify-between'>
        <ChartHeader
          title='Producción Diaria'
          value={`${dailyAverage.toLocaleString()} doc.`}
          interval='Promedio por día'
        />
        {!loading && yesterdayProd.Docenas && (
          <>
            <Divider />
            <ChartHeader
              title='Producido Ayer'
              value={`${yesterdayProd.Docenas.toLocaleString()} doc.`}
              interval={dayjs
                .tz(yesterdayProd.ProdDate)
                .locale('es')
                .format('ddd DD/MM')}
            />
          </>
        )}
      </Stack>
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
        yAxis={[
          {
            max: room.startsWith('SEAMLESS') ? 1500 : 3000,
            colorMap: {
              type: 'piecewise',
              thresholds: [dailyAverage * 0.9, dailyAverage],
              colors: [colors.red, colors.yellow, colors.green],
            },
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
    </ChartContent>
  );
}
