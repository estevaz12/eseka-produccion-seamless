import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import DailyProduction from '../components/Dashboard/DailyProduction.jsx';
import TotalProduced from '../components/Dashboard/TotalProduced.jsx';
import { useEffect, useMemo, useState } from 'react';
import { useConfig } from '../ConfigContext.jsx';
import CurrentEff from '../components/Dashboard/CurrentEff.jsx';
import DailyEff from '../components/Dashboard/DailyEff.jsx';
import MonthSaldo from '../components/Dashboard/MonthSaldo.jsx';
import TotalEstimate from '../components/Dashboard/TotalEstimate.jsx';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import DateEstimate from '../components/Dashboard/DateEstimate.jsx';
import RequiredProd from '../components/Dashboard/RequiredProd.jsx';

dayjs.extend(isSameOrBefore);

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

  const totalProduced = useMemo(() => {
    return dailyProd.reduce((acc, row) => acc + row.Docenas, 0);
  }, [dailyProd]);

  const dailyAverage = useMemo(() => {
    if (!dailyProd || dailyProd.length === 0) return 0;
    const total = dailyProd.reduce((sum, item) => sum + item.Docenas, 0);
    return Math.round(total / dailyProd.length);
  }, [dailyProd]);

  const monthEnd = now.endOf('month');
  // Count non-holiday weekdays left including today
  let workdaysLeft = 0;
  let current = now.clone();
  while (current.isSameOrBefore(monthEnd, 'day')) {
    const day = current.day(); // 0: Sunday, 1: Monday, ..., 6: Saturday
    const currFmt = current.format('YYYY-MM-DD');
    const isHoliday = holidays.includes(currFmt);
    if (day >= 1 && day <= 5 && !isHoliday) workdaysLeft++;
    current = current.add(1, 'day');
  }

  return (
    <Box className='grid w-full h-screen grid-cols-4 gap-4 py-4 auto-rows-fr *:flex-none'>
      {/* Top */}
      <Card>
        <TotalProduced
          dataset={dailyProd}
          totalProduced={totalProduced}
          loading={dailyProd.length === 0}
        />
      </Card>
      <Card>
        <TotalEstimate
          totalProduced={totalProduced}
          dailyAverage={dailyAverage}
          progTotal={progTotal}
          workdaysLeft={workdaysLeft}
          loading={
            dailyProd.length === 0 || holidays.length === 0 || progTotal === 0
          }
        />
      </Card>
      <Card>
        <DateEstimate
          totalProduced={totalProduced}
          dailyAverage={dailyAverage}
          progTotal={progTotal}
          holidays={holidays}
          loading={
            dailyProd.length === 0 || holidays.length === 0 || progTotal === 0
          }
        />
      </Card>
      <Card>
        <RequiredProd
          progTotal={progTotal}
          totalProduced={totalProduced}
          workdaysLeft={workdaysLeft}
          loading={
            dailyProd.length === 0 || holidays.length === 0 || progTotal === 0
          }
        />
      </Card>
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
        <DailyProduction
          dataset={dailyProd}
          dailyAverage={dailyAverage}
          loading={dailyProd.length === 0}
        />
      </Card>
    </Box>
  );
}
