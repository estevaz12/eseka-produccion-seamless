// TODO porcentaje as fraction

import { Box, Typography } from '@mui/joy';
import { useEffect, useState } from 'react';
import { useConfig } from '../ConfigContext.jsx';
import { DatePicker } from '@mui/x-date-pickers';
import ProgramadaTable from '../components/ProgramadaTable.jsx';
import ProgSearchForm from '../components/ProgSearchForm.jsx';
import dayjs from 'dayjs';

// to avoid useEffect dependency issues
let apiUrl;

export default function Programada() {
  apiUrl = useConfig().apiUrl;
  const [currTotal, setCurrTotal] = useState();
  const [startDate, setStartDate] = useState();
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
    } else {
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
      <Typography>
        Total Actual:{' '}
        {currTotal !== undefined
          ? currTotal
          : localStorage.getItem('progStartDate')
          ? 'Cargando...'
          : 0}
      </Typography>

      <DatePicker
        label='Fecha de inicio'
        value={startDate ? dayjs(startDate) : null}
        disabled
      />

      <ProgSearchForm
        progColor={progColor}
        filteredProgColor={filteredProgColor}
        setFilteredProgColor={setFilteredProgColor}
      />

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
