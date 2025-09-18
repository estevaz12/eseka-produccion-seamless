import Dropdown from '@mui/joy/Dropdown';
import ListItem from '@mui/joy/ListItem';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import AspectRatio from '@mui/joy/AspectRatio';
import Skeleton from '@mui/joy/Skeleton';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import {
  calcIdealTime,
  calcRealTime,
  getDuration,
  getMachState,
  getWorkEff,
} from '../utils/maquinasUtils';

export default function MachineInfo({ mach, open, setOpened, machines }) {
  return (
    <Dropdown
      key={mach.MachCode}
      open={open === mach.MachCode}
      onOpenChange={(e, isOpen) => setOpened(isOpen ? mach.MachCode : 0)}
    >
      <MenuButton variant='soft' size='sm' className='p-2 font-medium'>
        <Stack direction='column' className='items-center gap-1'>
          <AspectRatio
            ratio='1'
            sx={{ width: 35 }}
            objectFit='contain'
            variant='plain'
          >
            <Skeleton loading={machines.length === 0}>
              <img src={getIconFor(mach)} />
            </Skeleton>
          </AspectRatio>
          <Typography>
            <Skeleton loading={machines.length === 0}>{mach.MachCode}</Skeleton>
          </Typography>
        </Stack>
      </MenuButton>
      <Menu placement='right-start'>
        <ListItem>
          <Typography level='title-lg'>Máquina: {mach.MachCode}</Typography>
        </ListItem>
        <ListItem>Cadena: {mach.StyleCode?.styleCode}</ListItem>
        <ListItem>Prendas: {mach.Pieces}</ListItem>
        <ListItem>Target: {mach.TargetOrder}</ListItem>
        <ListItem>Tiempo al 100%: {getDuration(calcIdealTime(mach))}</ListItem>
        <ListItem>Tiempo Real: {getDuration(calcRealTime(mach))}</ListItem>
        <ListItem>
          Efficiencia: {getWorkEff(mach) && `${getWorkEff(mach)}%`}
        </ListItem>
        <ListItem>Estado: {getMachState(mach).text}</ListItem>
      </Menu>
    </Dropdown>
  );
}

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
