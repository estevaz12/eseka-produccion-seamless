// TODO porcentaje as fraction - ask for num colors and then enter amount of
// items per color in surtido

import { Box, Stack, Typography } from '@mui/joy';
import { useEffect, useState } from 'react';
import { useConfig } from '../ConfigContext.jsx';
import ProgramadaTable from '../components/ProgramadaTable.jsx';
import ProgSearchForm from '../components/ProgSearchForm.jsx';
import dayjs from 'dayjs';
import StyledDatePicker from '../components/StyledDatePicker.jsx';

// to avoid useEffect dependency issues
let apiUrl;

export default function Programada() {
  apiUrl = useConfig().apiUrl;
  const [startDate, setStartDate] = useState();
  const [currTotal, setCurrTotal] = useState();
  const [progColor, setProgColor] = useState([]);
  const [filteredProgColor, setFilteredProgColor] = useState([]);

  // get current programada total on load
  useEffect(() => {
    let ignore = false;

    if (!startDate) {
      // fetch start date of current programada
      fetch(`${apiUrl}/programada/actualDate`)
        .then((res) => res.json())
        .then((data) => {
          if (!ignore) setStartDate(data[0].Date);
        })
        .catch((err) =>
          console.error('[CLIENT] Error fetching /programada/actualDate:', err)
        );
    } else if (startDate) {
      // fetch total of current programada
      fetch(`${apiUrl}/programada/total/${startDate}`)
        .then((res) => res.json())
        .then((data) => {
          if (!ignore) setCurrTotal(data[0].Total);
        })
        .catch((err) =>
          console.error('[CLIENT] Error fetching /programada/total:', err)
        );
    }

    return () => {
      ignore = true;
    };
  }, [startDate]);

  return (
    <Box>
      <Stack direction='row' className='items-end justify-between gap-4 mb-4'>
        <Stack direction='row' className='items-end gap-4'>
          <StyledDatePicker
            label='Fecha de inicio'
            value={startDate ? dayjs(startDate) : null}
            timezone='UTC'
            readOnly
          />

          <Typography>
            Total Actual:{' '}
            {currTotal !== undefined
              ? currTotal
              : startDate
              ? 'Cargando...'
              : 0}
          </Typography>
        </Stack>

        <ProgSearchForm
          progColor={progColor}
          filteredProgColor={filteredProgColor}
          setFilteredProgColor={setFilteredProgColor}
        />
      </Stack>

      <ProgramadaTable
        startDate={startDate}
        progColor={progColor}
        setProgColor={setProgColor}
        filteredProgColor={filteredProgColor}
        setFilteredProgColor={setFilteredProgColor}
      />
    </Box>
  );
}
