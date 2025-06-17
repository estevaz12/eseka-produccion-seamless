// TODO porcentaje as fraction

import { Box, Typography } from '@mui/joy';
import { useEffect, useState } from 'react';
import { useConfig } from '../ConfigContext.jsx';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import ProgramadaTable from '../components/ProgramadaTable.jsx';
import ProgSearchForm from '../components/ProgSearchForm.jsx';

// to avoid useEffect dependency issues
let apiUrl;

export default function Programada() {
  apiUrl = useConfig().apiUrl;
  const [currTotal, setCurrTotal] = useState();
  const [progColor, setProgColor] = useState([]);
  const [filteredProgColor, setFilteredProgColor] = useState([]);

  // get current programada total on load
  useEffect(() => {
    let ignore = false;
    if (!ignore && localStorage.getItem('progStartDate')) {
      fetchCurrTotal();
    }

    return () => {
      ignore = true;
    };
  }, []);

  function fetchCurrTotal() {
    fetch(`${apiUrl}/programada/total/${localStorage.getItem('progStartDate')}`)
      .then((res) => res.json())
      .then((data) => setCurrTotal(data[0].Total)) // single-record object
      .catch((err) => console.error('[CLIENT] Error fetching data:', err));
  }

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
        value={
          localStorage.getItem('progStartDate')
            ? dayjs(localStorage.getItem('progStartDate'))
            : null
        }
        disabled
      />

      <ProgSearchForm
        progColor={progColor}
        filteredProgColor={filteredProgColor}
        setFilteredProgColor={setFilteredProgColor}
      />

      <ProgramadaTable
        progColor={progColor}
        setProgColor={setProgColor}
        filteredProgColor={filteredProgColor}
        setFilteredProgColor={setFilteredProgColor}
      />
    </Box>
  );
}
