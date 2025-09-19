import { useContext, useEffect, useMemo, useRef, useState } from 'react';
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
import { useOutletContext } from 'react-router';
import { ToastsContext } from '../Contexts.js';
import electronicoSound from '../assets/sounds/electronico.wav';
import dayjs from 'dayjs';

let apiUrl;

export default function Maquinas() {
  apiUrl = useConfig().apiUrl;
  const { addToast, removeToast } = useContext(ToastsContext);
  const { room } = useOutletContext();
  const [machines, setMachines] = useState([]);
  const [filteredMachines, setFilteredMachines] = useState([]);

  const getMachines = () => {
    fetch(`${apiUrl}/${room}/machines`)
      .then((res) => res.json())
      .then((data) => setMachines(data))
      .catch((err) =>
        console.error(`[CLIENT] Error fetching /${room}/machines:`, err)
      );
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

  const sortedMachines = useMemo(
    () => [...machines].sort((a, b) => a.MachCode - b.MachCode),
    [machines]
  );

  const sortedFiltered = useMemo(
    () => [...filteredMachines].sort((a, b) => a.MachCode - b.MachCode),
    [filteredMachines]
  );

  const electronicoMachs = useMemo(
    () => machines.filter((m) => m.State === 6), // electronico
    [machines]
  );

  const electronicoIds = useMemo(
    () => electronicoMachs.map((m) => m.MachCode),
    [electronicoMachs]
  );

  const lastNotifiedIdsRef = useRef([]);

  // when there is a mach with electronico stop, send toast
  useEffect(() => {
    if (room !== 'ELECTRONICA') return;

    let ignore = false;

    const currentIds = electronicoIds;
    const lastIds = lastNotifiedIdsRef.current;

    // Find new machines
    const newIds = currentIds.filter((id) => !lastIds.includes(id));
    // Find removed machines
    const removedIds = lastIds.filter((id) => !currentIds.includes(id));

    // add toast for new machines
    if (newIds.length > 0) {
      newIds.forEach((id) => {
        addToast({
          message: `Máq. ${id} con ELECTRÓNICO`,
          type: 'warning',
          duration: null,
          machCode: id,
        });
      });

      if (!ignore) sendNotification(newIds);
    }
    // Remove toasts for removed machines
    if (removedIds.length > 0) {
      const currentToasts = JSON.parse(localStorage.getItem('toasts') || '[]');
      const removed = currentToasts.filter((t) =>
        removedIds.includes(t.machCode)
      );
      removed.forEach((t) => removeToast(t.id));
    }

    // update ref so we don't notify again until it changes
    lastNotifiedIdsRef.current = currentIds;

    return () => {
      ignore = true;
    };
  }, [room, electronicoIds]);

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

function sendNotification(electronicoMachs) {
  const notif = {
    title: 'ELECTRÓNICO',
    body: electronicoMachs
      .map((m) => `Máq. ${m} entró en ELECTRÓNICO`)
      .join('\n'),
    timeoutType: 'never',
  };

  window.electronAPI.notify(notif);

  // custom sound
  playAlertSound(3);

  // send telegram message if in working hours
  const now = dayjs.tz();
  // Monday to Saturday
  if (now.day() < 1 || now.day() > 6) return;
  // After 7am
  if (now.hour() < 7) return;
  // Before 4pm on weekdays
  if (now.day() !== 6 && now.hour() > 16) return;
  // Saturday before 1pm
  if (now.hour() > 13) return;

  fetch(`${process.env.BOT_API}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: process.env.CHAT_ID,
      text: notif.body,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.ok) {
        console.log('Telegram message sent');
      } else {
        console.error('Error sending Telegram message:', data.description);
      }
    })
    .catch((err) => console.error(err));
}

function playAlertSound(times = 5, interval = 1000) {
  let played = 0;
  const playOnce = () => {
    const audio = new Audio(electronicoSound);
    audio.play().catch((err) => console.error('Audio play error:', err));
    played++;
    if (played < times) {
      setTimeout(playOnce, interval); // interval in ms between plays
    }
  };
  playOnce();
}
