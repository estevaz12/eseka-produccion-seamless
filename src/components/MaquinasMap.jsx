import Dropdown from '@mui/joy/Dropdown';
import ListItem from '@mui/joy/ListItem';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import AspectRatio from '@mui/joy/AspectRatio';
import Box from '@mui/joy/Box';
import Skeleton from '@mui/joy/Skeleton';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { useState } from 'react';
import {
  calcIdealTime,
  calcRealTime,
  getDuration,
  getMachState,
  getWorkEff,
  isProducing,
} from '../utils/maquinasUtils';
import { Card } from '@mui/joy';

export default function MaquinasMap({ machines }) {
  const [open, setOpened] = useState(0);

  const loadingMachs = Array.from(
    { length: groups[groups.length - 1].max - groups[0].min },
    (_, i) => ({ MachCode: i + groups[0].min })
  );

  return (
    <>
      {groups.map((group) => (
        <Stack direction='column' className='gap-2 even:mt-8' key={group.min}>
          <Typography level='h4'>{`${group.min} - ${group.max}`}</Typography>

          <Box className='grid gap-2 grid-cols-15'>
            {[...(machines.length === 0 ? loadingMachs : machines)].map(
              (m) =>
                m.MachCode >= group.min &&
                m.MachCode <= group.max && (
                  <Dropdown
                    key={m.MachCode}
                    open={open === m.MachCode}
                    onOpenChange={(e, isOpen) =>
                      setOpened(isOpen ? m.MachCode : 0)
                    }
                  >
                    <MenuButton
                      variant='soft'
                      size='lg'
                      className='p-2 font-medium'
                    >
                      <Stack direction='column' className='items-center gap-1'>
                        <AspectRatio
                          ratio='1'
                          sx={{ width: 50 }}
                          objectFit='contain'
                          variant='plain'
                        >
                          <Skeleton
                            animation='wave'
                            loading={machines.length === 0}
                          >
                            <img src={getIconFor(m)} />
                          </Skeleton>
                        </AspectRatio>
                        <Typography>
                          <Skeleton
                            animation='wave'
                            loading={machines.length === 0}
                          >
                            {m.MachCode}
                          </Skeleton>
                        </Typography>
                      </Stack>
                    </MenuButton>
                    <Menu placement='right-start'>
                      <ListItem>
                        <Typography level='title-lg'>
                          Máquina: {m.MachCode}
                        </Typography>
                      </ListItem>
                      <ListItem>Cadena: {m.StyleCode}</ListItem>
                      <ListItem>Prendas: {m.Pieces}</ListItem>
                      <ListItem>Target: {m.TargetOrder}</ListItem>
                      <ListItem>
                        Tiempo al 100%: {getDuration(calcIdealTime(m))}
                      </ListItem>
                      <ListItem>
                        Tiempo Real: {getDuration(calcRealTime(m))}
                      </ListItem>
                      <ListItem>
                        Efficiencia: {getWorkEff(m) && `${getWorkEff(m)}%`}
                      </ListItem>
                      <ListItem>Estado: {getMachState(m).text}</ListItem>
                    </Menu>
                  </Dropdown>
                )
            )}
          </Box>
        </Stack>
      ))}

      <Card
        color='primary'
        variant='soft'
        className='fixed z-10 bottom-4 right-4 left-44'
        sx={{ boxShadow: 'md' }}
      >
        <Stack direction='row' className='items-center justify-between gap-4'>
          {[
            ['Máquinas: ', machines.length],
            ['Tejiendo: ', machines.filter((m) => m.State === 0).length],
            [
              'Stop General: ',
              machines.filter((m) => isProducing(m) && m.State !== 0).length,
            ],
            [
              'Paradas: ',
              machines.filter(
                (m) => !isProducing(m) && ![1, 13, 56, 65535].includes(m.State)
              ).length,
            ],
            [
              'Apagadas: ',
              machines.filter((m) => [1, 13, 56, 65535].includes(m.State))
                .length,
            ],
          ].map(([label, value]) => (
            <Typography key={label}>
              <Typography level='title-lg'>{label}</Typography>
              <Typography
                level='body-lg'
                variant='outlined'
                className='bg-white rounded-md'
              >
                <Skeleton animation='wave' loading={machines.length === 0}>
                  {machines.length === 0 ? '00' : value}
                </Skeleton>
              </Typography>
            </Typography>
          ))}
        </Stack>
      </Card>
    </>
  );
}

const groups = [
  { min: 1001, max: 1030 },
  { min: 1031, max: 1037 },
];

function importAll(r) {
  const icons = {};
  r.keys().forEach((k) => {
    const name = k.replace('./', '').replace(/\.(png|jpg|jpeg|gif|svg)$/, '');
    icons[name] = r(k);
  });
  return icons;
}

// All files under ../assets/images/mach_states/*.png
const stateIcons = importAll(
  require.context(
    '../assets/images/mach_states',
    false,
    /\.(png|jpe?g|gif|svg)$/
  )
);

// Example: pick icon by state key on machine object (fallback to 'offline')
function getIconFor(machine) {
  /* Machine states
  0: RUN
  1: POWER OFF
  2: STOP BUTTON
  3: AUTOMATIC STOP
  4: TARGET
  5: F1 / GIRANDO
  6: ELECTRÓNICO
  7: MECÁNICO
  8: PRODUCCIÓN
  9: FALTA HILADO
  10: FALTA REPUESTO
  11: MUESTRA
  12: CAMBIO DE ARTICULO
  13: TURBINA
  56: OFFLINE
  65535: DESINCRONIZADA
  */
  const stateMapping = {
    0: 'run',
    1: 'power_off',
    2: 'stop_general',
    3: 'stop_general',
    4: 'target',
    5: 'f1',
    6: 'electronico',
    7: 'mecanico',
    8: 'produccion',
    9: 'falta_hilado',
    10: 'falta_repuesto',
    11: 'muestra',
    12: 'cambio',
    13: 'turbina',
    56: 'offline',
    65535: 'desync',
  };

  return stateIcons[stateMapping[machine.State]] || stateIcons['unknown'];
}
