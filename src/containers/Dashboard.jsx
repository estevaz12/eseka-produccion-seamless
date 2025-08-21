import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import DailyProduction from '../components/Dashboard/DailyProduction.jsx';
import TotalProduced from '../components/Dashboard/TotalProduced.jsx';
import { useEffect, useState } from 'react';
import { useConfig } from '../ConfigContext.jsx';
import CurrentEff from '../components/Dashboard/CurrentEff.jsx';
import DailyEff from '../components/Dashboard/DailyEff.jsx';
import MonthSaldo from '../components/Dashboard/MonthSaldo.jsx';

let apiUrl;
export default function Dashboard() {
  apiUrl = useConfig().apiUrl;
  const [dataset, setDataset] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignored = false;
    const room = 'SEAMLESS';

    fetch(`${apiUrl}/stats/dailyProduction/${room}`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignored) {
          setDataset(data);
          setLoading(false);
        }
      })
      .catch((err) =>
        console.error('[CLIENT] Error fetching /stats/dailyProduction:', err)
      );

    return () => {
      ignored = true;
    };
  }, []);

  return (
    <Box className='grid w-full h-screen grid-cols-4 gap-4 py-4'>
      {/* Top */}
      <Card>
        <TotalProduced dataset={dataset} loading={loading} />
      </Card>
      <Card></Card>
      <Card></Card>
      <Card></Card>

      {/* Center */}
      <Card>
        <DailyEff />
      </Card>
      <Card className='col-span-2'>
        <CurrentEff />
      </Card>
      <Card>
        <MonthSaldo />
      </Card>

      {/* Bottom */}
      <Card className='col-span-4'>
        <DailyProduction dataset={dataset} loading={loading} />
      </Card>
    </Box>
  );
}
