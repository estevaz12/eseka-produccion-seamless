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
import { useOutletContext } from 'react-router';

dayjs.extend(isSameOrBefore);

let apiUrl;
export default function Dashboard() {
  apiUrl = useConfig().apiUrl;
  const { room } = useOutletContext();
  const [dailyProd, setDailyProd] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [progTotal, setProgTotal] = useState(null);
  const [yesterdayEff, setYesterdayEff] = useState({});
  const now = dayjs.tz();

  useEffect(() => {
    let ignore = false;
    let timeoutId;

    fetch(`${apiUrl}/${room}/stats/dailyProduction`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignore) {
          setDailyProd(
            data.length !== 0 ? data : [{ ProdDate: null, Docenas: null }]
          );
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

        if (!ignore) {
          setHolidays(flat);
        }
      })
      .catch((err) => console.error('[CLIENT] Error fetching holidays:', err));

    fetch(`${apiUrl}/${room}/programada/actualDate`)
      .then((res) => res.json())
      .then((data) => {
        const month = now.month() + 1; // month is 0-indexed in dayjs
        const year = now.year();

        if (!ignore) {
          // if fetched date is not current month and year, set start date null
          if (data[0].Month !== month || data[0].Year !== year) setProgTotal(0);
          else {
            fetch(`${apiUrl}/${room}/programada/total/${data[0].Date}`)
              .then((res) => res.json())
              .then((data) => {
                if (!ignore) {
                  setProgTotal(data[0].Total);
                }
              })
              .catch((err) =>
                console.error('[CLIENT] Error fetching /programada/total:', err)
              );
          }
        }
      })
      .catch((err) =>
        console.error('[CLIENT] Error fetching /programada/actualDate:', err)
      );

    // on initial render, calculate time remaining until next 6:00:02 AM
    // to reload data in case page remains open indefinitely
    const currDate = dayjs.tz();
    let nextDate = currDate.hour(6).minute(0).second(2);
    if (nextDate.isBefore(currDate)) {
      nextDate = nextDate.add(1, 'day');
    }
    const timeRemaining = nextDate.diff(currDate);
    timeoutId = setTimeout(() => window.location.reload(), timeRemaining);

    return () => {
      ignore = true;
      clearTimeout(timeoutId);
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

  const estimate = totalProduced + dailyAverage * workdaysLeft;
  const progress =
    progTotal === 0 ? 0 : Math.round((estimate / progTotal) * 100);

  return (
    <Box className='grid w-full h-screen grid-cols-4 gap-4 py-4 auto-rows-fr *:flex-none'>
      {/* Top */}
      <Card>
        <TotalProduced
          dataset={dailyProd}
          totalProduced={totalProduced}
          progress={progress}
          loading={dailyProd.length === 0}
        />
      </Card>
      <Card>
        <TotalEstimate
          estimate={estimate}
          progTotal={progTotal}
          progress={progress}
          loading={
            dailyProd.length === 0 || progTotal === null //|| holidays.length === 0
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
            dailyProd.length === 0 || progTotal === null //|| holidays.length === 0
          }
        />
      </Card>
      <Card>
        <RequiredProd
          progTotal={progTotal}
          totalProduced={totalProduced}
          workdaysLeft={workdaysLeft}
          loading={
            dailyProd.length === 0 || progTotal === null //|| holidays.length === 0
          }
        />
      </Card>
      {/* Center */}
      <Card>
        <DailyEff setYesterdayEff={setYesterdayEff} />
      </Card>
      <Card className='col-span-2'>
        <CurrentEff yesterdayEff={yesterdayEff} />
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
