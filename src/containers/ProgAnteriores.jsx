import Box from '@mui/joy/Box';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Option from '@mui/joy/Option';
import Select from '@mui/joy/Select';
import Stack from '@mui/joy/Stack';
import ProgramadaTable from '../components/Tables/ProgramadaTable.jsx';
import ProgSearchForm from '../components/Forms/ProgSearchForm.jsx';
import { useEffect, useState } from 'react';
import { useConfig } from '../ConfigContext.jsx';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

let apiUrl;
export default function ProgAnteriores() {
  apiUrl = useConfig().apiUrl;
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState();
  const [progColor, setProgColor] = useState([]);
  const [filteredProgColor, setFilteredProgColor] = useState([]);

  useEffect(() => {
    let ignore = false;
    fetch(`${apiUrl}/programada/loadDates`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignore) setDates(data);
      })
      .catch((err) =>
        console.error('[CLIENT] Error fetching /programada/loadDates:', err)
      );

    return () => {
      ignore = true;
    };
  }, []);

  function handleChange(val) {
    if (!val) return;
    const [date, month, year, idx] = val.split('|');
    setSelectedDate(date);
    const params = new URLSearchParams({
      startDate: date,
      startMonth: month,
      startYear: year,
      endDate: dates[idx - 1].Date, // dates are ordered desc
    }).toString();
    fetch(`${apiUrl}/programada?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setProgColor(data);
      });
  }

  return (
    <Box>
      <Stack
        direction='row'
        className='items-end justify-between top-0 bg-[var(--joy-palette-background-body)] sticky z-10 py-4'
      >
        <FormControl className='min-w-48'>
          <FormLabel>Fecha</FormLabel>
          <Select
            placeholder='Seleccione...'
            onChange={(e, val) => {
              handleChange(val);
            }}
          >
            {dates.slice(1).map((row, i) => (
              // sliced array doesn't include the current programada date
              // so we add 1 to idx value to match dates array index
              <Option
                key={i}
                value={`${row.Date}|${row.Month}|${row.Year}|${i + 1}`}
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
          editable={false}
          live={false}
        />
      )}
    </Box>
  );
}
