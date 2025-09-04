import Box from '@mui/joy/Box';
import Stack from '@mui/joy/Stack';
import { useEffect, useState } from 'react';
import { useConfig } from '../ConfigContext.jsx';
import ProgramadaTable from '../components/Tables/ProgramadaTable.jsx';
import ProgSearchForm from '../components/Forms/ProgSearchForm.jsx';
import dayjs from 'dayjs';
import { StyledDatePicker } from '../components/Inputs/StyledPickers.jsx';
import ProgTotal from '../components/ProgTotal.jsx';
import RefreshBtn from '../components/RefreshBtn.jsx';

// to avoid useEffect dependency issues
let apiUrl;

export default function Programada() {
  apiUrl = useConfig().apiUrl;
  const { room } = useOutletContext();
  const [startDate, setStartDate] = useState();
  const [progColor, setProgColor] = useState([]);
  const [filteredProgColor, setFilteredProgColor] = useState([]);

  // get current programada total on load
  useEffect(() => {
    let ignore = false;

    if (!startDate) {
      // fetch start date of current programada
      fetch(`${apiUrl}/${room}/programada/actualDate`)
        .then((res) => res.json())
        .then((data) => {
          if (!ignore) setStartDate(data[0].Date);
        })
        .catch((err) =>
          console.error('[CLIENT] Error fetching /programada/actualDate:', err)
        );
    }

    return () => {
      ignore = true;
    };
  }, [room, startDate]);

  function handleRefresh() {
    if (startDate) {
      const params = new URLSearchParams({
        startDate,
      }).toString();
      fetch(`${apiUrl}/${room}/programada?${params}`)
        .then((res) => res.json())
        .then((data) => {
          setProgColor(data);
        })
        .catch((err) =>
          console.error(`[CLIENT] Error fetching /${room}/programada:`, err)
        );
    }
  }

  return (
    <Box>
      <Stack
        direction='row'
        className='sticky z-10 items-end justify-between gap-4 top-0 bg-[var(--joy-palette-background-body)] py-4'
      >
        <Stack direction='row' className='items-end gap-4'>
          <RefreshBtn handleRefresh={handleRefresh} />

          <StyledDatePicker
            label='Fecha de inicio'
            value={startDate ? dayjs.tz(startDate) : null}
            disabled
          />

          <ProgTotal startDate={startDate} />
        </Stack>

        <ProgSearchForm
          progColor={progColor}
          filteredProgColor={filteredProgColor}
          setFilteredProgColor={setFilteredProgColor}
          live={true}
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
