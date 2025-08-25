import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import DailyProduction from '../components/Dashboard/DailyProduction.jsx';
import TotalProduced from '../components/Dashboard/TotalProduced.jsx';
import { useEffect, useState } from 'react';
import { useConfig } from '../ConfigContext.jsx';
import CurrentEff from '../components/Dashboard/CurrentEff.jsx';
import DailyEff from '../components/Dashboard/DailyEff.jsx';
import MonthSaldo from '../components/Dashboard/MonthSaldo.jsx';
import TotalEstimate from '../components/Dashboard/TotalEstimate.jsx';
import dayjs from 'dayjs';

let apiUrl;
export default function Dashboard() {
  apiUrl = useConfig().apiUrl;
  const [dailyProd, setDailyProd] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [progTotal, setProgTotal] = useState(0);
  const now = dayjs.tz();

  useEffect(() => {
    let ignored = false;
    const room = 'SEAMLESS';

    fetch(`${apiUrl}/stats/dailyProduction/${room}`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignored) {
          setDailyProd(data);
        }
      })
      .catch((err) =>
        console.error('[CLIENT] Error fetching /stats/dailyProduction:', err)
      );

    fetch(`https://api.argentinadatos.com/v1/feriados/${now.year()}`)
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter(
          (d) =>
            dayjs.tz(d.fecha).month() === now.month() && d.tipo !== 'puente'
        );
        const flat = filtered.map((d) => d.fecha);

        if (!ignored) {
          setHolidays(flat);
        }
      })
      .catch((err) => console.error('[CLIENT] Error fetching holidays:', err));

    fetch(`${apiUrl}/programada/actualDate`)
      .then((res) => res.json())
      .then((data) =>
        fetch(`${apiUrl}/programada/total/${data[0].Date}`)
          .then((res) => res.json())
          .then((data) => {
            if (!ignored) {
              setProgTotal(data[0].Total);
            }
          })
          .catch((err) =>
            console.error('[CLIENT] Error fetching /programada/total:', err)
          )
      )
      .catch((err) =>
        console.error('[CLIENT] Error fetching /programada/actualDate:', err)
      );

    return () => {
      ignored = true;
    };
  }, []);

  return (
    <Box className='grid w-full h-screen grid-cols-4 gap-4 py-4 auto-rows-fr *:flex-none'>
      {/* Top */}
      <Card>
        <TotalProduced dataset={dailyProd} loading={dailyProd.length === 0} />
      </Card>
      <Card>
        <TotalEstimate
          dataset={dailyProd}
          progTotal={progTotal}
          holidays={holidays}
          loading={
            dailyProd.length === 0 || holidays.length === 0 || progTotal === 0
          }
        />
      </Card>
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
        <DailyProduction dataset={dailyProd} loading={dailyProd.length === 0} />
      </Card>
    </Box>
  );
}
