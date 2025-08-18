import { useEffect, useMemo, useState } from 'react';
import { useConfig } from '../ConfigContext.jsx';
import Stack from '@mui/joy/Stack';
import RefreshBtn from '../components/RefreshBtn.jsx';
import MaquinasTable from '../components/Tables/MaquinasTable.jsx';
import MachSearchForm from '../components/Forms/MachSearchForm.jsx';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import Tab, { tabClasses } from '@mui/joy/Tab';
import TabList from '@mui/joy/TabList';
import TabPanel from '@mui/joy/TabPanel';
import Tabs from '@mui/joy/Tabs';
import MapTwoTone from '@mui/icons-material/MapTwoTone';
import TableChartTwoTone from '@mui/icons-material/TableChartTwoTone';
import MaquinasMap from '../components/MaquinasMap.jsx';

let apiUrl;

export default function Maquinas() {
  apiUrl = useConfig().apiUrl;
  const [machines, setMachines] = useState([]);
  const [filteredMachines, setFilteredMachines] = useState([]);

  const sortedMachines = useMemo(
    () => [...machines].sort((a, b) => a.MachCode - b.MachCode),
    [machines]
  );

  const sortedFiltered = useMemo(
    () => [...filteredMachines].sort((a, b) => a.MachCode - b.MachCode),
    [filteredMachines]
  );

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
    <Tabs
      aria-label='tabs'
      defaultValue={0}
      size='sm'
      sx={{ bgcolor: 'transparent' }}
      className='sticky top-0 z-10'
    >
      <Stack
        direction='row'
        className='sticky top-0 z-10 items-end justify-between gap-4 bg-[var(--joy-palette-background-body)] py-4'
      >
        <RefreshBtn handleRefresh={getMachines} />

        <TabList
          disableUnderline
          sx={{
            p: 0.5,
            gap: 0.5,
            borderRadius: 'lg',
            bgcolor: 'background.level1',
            [`& .${tabClasses.root}[aria-selected="true"]`]: {
              boxShadow: 'sm',
              bgcolor: 'background.surface',
            },
          }}
        >
          <Tab disableIndicator>
            <ListItemDecorator>
              <MapTwoTone />
            </ListItemDecorator>
            Mapa
          </Tab>
          <Tab disableIndicator>
            <ListItemDecorator>
              <TableChartTwoTone />
            </ListItemDecorator>
            Tabla
          </Tab>
        </TabList>

        {/* search inputs */}
        <MachSearchForm
          machines={machines}
          setFilteredMachines={setFilteredMachines}
        />
      </Stack>

      {/* table and map */}
      <TabPanel value={0} className='p-0'>
        <MaquinasMap
          machines={
            filteredMachines.length > 0 ? sortedFiltered : sortedMachines
          }
        />
      </TabPanel>
      <TabPanel value={1} className='p-0'>
        <MaquinasTable
          machines={filteredMachines.length > 0 ? filteredMachines : machines}
          pdfRows={machines}
        />
      </TabPanel>
    </Tabs>
  );
}
