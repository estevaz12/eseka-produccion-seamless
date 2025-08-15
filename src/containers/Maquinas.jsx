import { useEffect, useState } from 'react';
import { useConfig } from '../ConfigContext.jsx';
import Box from '@mui/joy/Box';
import Stack from '@mui/joy/Stack';
import RefreshBtn from '../components/RefreshBtn.jsx';
import MaquinasTable from '../components/Tables/MaquinasTable.jsx';
import MachSearchForm from '../components/Forms/MachSearchForm.jsx';

let apiUrl;

// TODO: ROOM VIEW
export default function Maquinas() {
  apiUrl = useConfig().apiUrl;
  const [machines, setMachines] = useState([]);
  const [filteredMachines, setFilteredMachines] = useState([]);

  const getMachines = () => {
    fetch(`${apiUrl}/machines`)
      .then((res) => res.json())
      .then((data) => setMachines(data))
      .catch((err) => console.error('[CLIENT] Error fetching /machines:', err));
  };

  // get machines on load
  useEffect(() => {
    let ignore = false;
    if (!ignore) getMachines();
    // update every 30 seconds
    const intervalId = setInterval(() => {
      if (!ignore) getMachines();
    }, 30000);

    return () => {
      ignore = true;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <Box>
      <Stack
        direction='row'
        className='sticky z-10 items-end justify-between gap-4 top-0 bg-[var(--joy-palette-background-body)] py-4'
      >
        <RefreshBtn handleRefresh={getMachines} />

        {/* search inputs */}
        <MachSearchForm
          machines={machines}
          setFilteredMachines={setFilteredMachines}
        />
      </Stack>

      <MaquinasTable
        machines={filteredMachines.length > 0 ? filteredMachines : machines}
        pdfRows={machines}
      />
    </Box>
  );
}
