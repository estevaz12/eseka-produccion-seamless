import { Box, FormControl, FormLabel, Option, Select } from '@mui/joy';
import ProgramadaTable from '../components/ProgramadaTable.jsx';
import ProgSearchForm from '../components/ProgSearchForm.jsx';
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
    const [date, month, year] = val.split('|');
    setSelectedDate(date);
    const params = new URLSearchParams({
      startDate: date,
      endMonth: month,
      endYear: year,
    }).toString();
    fetch(`${apiUrl}/programada?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setProgColor(data.progColor);
      });
  }

  return (
    <Box>
      <FormControl>
        <FormLabel>Fecha</FormLabel>
        <Select
          placeholder='Seleccione una fecha...'
          onChange={(e, val) => {
            handleChange(val);
          }}
        >
          {dates.map((row) => (
            <Option
              key={row.Date}
              value={`${row.Date}|${row.Month}|${row.Year}`}
            >
              {`${dayjs()
                .month(row.Month - 1)
                .locale('es')
                .format('MMMM')} ${row.Year}`}
            </Option>
          ))}
        </Select>
      </FormControl>

      <ProgSearchForm
        progColor={progColor}
        filteredProgColor={filteredProgColor}
        setFilteredProgColor={setFilteredProgColor}
      />

      <ProgramadaTable
        startDate={selectedDate}
        progColor={progColor}
        setProgColor={setProgColor}
        filteredProgColor={filteredProgColor}
        setFilteredProgColor={setFilteredProgColor}
        live={false}
      />
    </Box>
  );
}
