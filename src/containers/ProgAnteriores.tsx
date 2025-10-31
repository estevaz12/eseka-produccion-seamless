import Box from '@mui/joy/Box';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Option from '@mui/joy/Option';
import Select from '@mui/joy/Select';
import Stack from '@mui/joy/Stack';
import ProgramadaTable from '../components/Tables/ProgramadaTable.jsx';
import ProgSearchForm from '../components/Forms/ProgSearchForm.jsx';
import { useEffect, useState } from 'react';
import { useConfig } from '../ConfigContext.tsx';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { useOutletContext } from 'react-router';
import { OutletContextType } from '../types/ui.ts';
import { ProgLoadDate } from '../types/db.ts';
import { ProgColorTable } from '../types/api.ts';

let apiUrl: string;
export default function ProgAnteriores() {
  apiUrl = useConfig().apiUrl;
  const { room } = useOutletContext<OutletContextType>();
  const [dates, setDates] = useState<ProgLoadDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>();
  const [progColor, setProgColor] = useState<ProgColorTable[]>([]);
  const [filteredProgColor, setFilteredProgColor] = useState<ProgColorTable[]>(
    []
  );

  useEffect(() => {
    let ignore = false;
    fetch(`${apiUrl}/${room}/programada/loadDates`)
      .then((res) => res.json())
      .then((data) => {
        const now = dayjs.tz();
        const currMonth = now.month() + 1;
        const currYear = now.year();
        const topDate = data[0];
        let datesArr = data;

        if (topDate.Month === currMonth && topDate.Year === currYear)
          datesArr = data.slice(1);

        if (!ignore) setDates(datesArr);
      })
      .catch((err) =>
        console.error('[CLIENT] Error fetching /programada/loadDates:', err)
      );

    return () => {
      ignore = true;
    };
  }, []);

  function handleChange(val: string) {
    if (!val) return;
    const [date, month, year, idxStr] = val.split('|');
    const idx = parseInt(idxStr);
    setSelectedDate(date);
    // if the selected date is the first one, set the end date to the start of
    // the current month
    // This is needed when there is no programada for the current month
    // Otherwise, the end date will be the same as the start date
    const endDate =
      dates[idx] === dates[0]
        ? dayjs.tz().startOf('month').format()
        : dates[idx - 1].Date;

    const params = new URLSearchParams({
      startDate: date,
      startMonth: month,
      startYear: year,
      endDate: endDate,
    }).toString();
    fetch(`${apiUrl}/${room}/programada?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setProgColor(data);
      });
  }

  return (
    <Box>
      <Stack
        direction='row'
        className='items-end justify-between top-0 bg-(--joy-palette-background-body) sticky z-10 py-4'
      >
        <FormControl className='min-w-48'>
          <FormLabel>Fecha</FormLabel>
          <Select
            placeholder='Seleccione...'
            onChange={(e, val: string) => {
              handleChange(val);
            }}
          >
            {dates.map((row, i) => (
              <Option
                key={i}
                value={`${row.Date}|${row.Month}|${row.Year}|${i}`}
              >
                {`${dayjs
                  .tz()
                  .month(row.Month - 1)
                  .locale('es')
                  .format('MMMM')} ${row.Year}`}
              </Option>
            ))}
          </Select>
        </FormControl>

        {selectedDate && (
          <ProgSearchForm
            progColor={progColor}
            filteredProgColor={filteredProgColor}
            setFilteredProgColor={setFilteredProgColor}
            live={false}
          />
        )}
      </Stack>

      {selectedDate && (
        <ProgramadaTable
          startDate={selectedDate}
          progColor={progColor}
          setProgColor={setProgColor}
          filteredProgColor={filteredProgColor}
          setFilteredProgColor={setFilteredProgColor}
          live={false}
        />
      )}
    </Box>
  );
}
