import Skeleton from '@mui/joy/Skeleton';
import { PieChart } from '@mui/x-charts';
import { useEffect, useState } from 'react';
import { useConfig } from '../../ConfigContext.jsx';
import { styled } from '@mui/joy/styles';
import { useDrawingArea } from '@mui/x-charts/hooks';

let apiUrl;
export default function MonthSaldo() {
  apiUrl = useConfig().apiUrl;
  const [loading, setLoading] = useState(true);
  const [dataset, setDataset] = useState({ porc: '0', data: [] });
  // for saldo width, since it's so small
  const saldoWidth = 20;

  useEffect(() => {
    let ignored = false;
    const room = 'SEAMLESS';

    fetch(`${apiUrl}/stats/monthSaldo/${room}`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignored) {
          setDataset(data);
          setLoading(false);
        }
      })
      .catch((err) =>
        console.error('[CLIENT] Error fetching /stats/monthSaldo:', err)
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
      <PieChart
        loading={loading}
        series={[
          {
            data: dataset.data.map((item) => ({
              ...item,
              value:
                item.label === 'Saldo' ? item.value * saldoWidth : item.value,
            })),
            valueFormatter: (v) => {
              if (v.label === 'Saldo') return v.value / saldoWidth;
              else return v.value;
            },
            highlightScope: { fade: 'global', highlight: 'item' },
            // faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
            innerRadius: '75%',
            paddingAngle: 5,
            cornerRadius: 8,
          },
        ]}
        margin={0}
        hideLegend
      >
        <PieCenterLabel>{dataset.porc}%</PieCenterLabel>
      </PieChart>
    </Skeleton>
  );
}

const StyledText = styled('text')(({ theme }) => ({
  fill: theme.palette.text.primary,
  textAnchor: 'middle',
  dominantBaseline: 'central',
  ...theme.typography.h2,
}));

function PieCenterLabel({ children }) {
  const { width, height, left, top } = useDrawingArea();
  return (
    <StyledText x={left + width / 2} y={top + height / 2}>
      {children}
    </StyledText>
  );
}
