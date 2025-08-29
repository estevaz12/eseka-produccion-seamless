import CrisisAlertRounded from '@mui/icons-material/CrisisAlertRounded';
import DownloadRounded from '@mui/icons-material/DownloadRounded';
import FlagRounded from '@mui/icons-material/FlagRounded';
import ListAltRounded from '@mui/icons-material/ListAltRounded';
import QuestionMarkRounded from '@mui/icons-material/QuestionMarkRounded';
import SyncProblemRounded from '@mui/icons-material/SyncProblemRounded';
import ReportRounded from '@mui/icons-material/ReportRounded';
import PendingActionsRounded from '@mui/icons-material/PendingActionsRounded';
import Box from '@mui/joy/Box';
import Dropdown from '@mui/joy/Dropdown';
import ListDivider from '@mui/joy/ListDivider';
import ListItem from '@mui/joy/ListItem';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';

export default function ProgLegend({ live }) {
  return (
    <Dropdown>
      <MenuButton
        variant='outlined'
        size='sm'
        startDecorator={
          <ListAltRounded className='text-neutral group-hover:text-[var(--joy-palette-neutral-700)]' />
        }
        className='font-normal hover:bg-white group'
      >
        Leyenda
      </MenuButton>
      <Menu size='sm' placement='top-end'>
        <ListItem>
          <ListItemDecorator>
            <Box className='size-4 bg-todo rounded-[var(--joy-radius-sm)]' />
          </ListItemDecorator>{' '}
          Aprobado
        </ListItem>
        <ListItem>
          <ListItemDecorator>
            <Box className='size-4 bg-making rounded-[var(--joy-radius-sm)]' />
          </ListItemDecorator>{' '}
          Tejiendo
        </ListItem>
        <ListItem>
          <ListItemDecorator>
            <Box className='size-4 bg-done rounded-[var(--joy-radius-sm)]' />
          </ListItemDecorator>{' '}
          Terminado
        </ListItem>
        <ListItem>
          <ListItemDecorator>
            <Box className='size-4 bg-almost-done rounded-[var(--joy-radius-sm)]' />
          </ListItemDecorator>{' '}
          Casi terminado
        </ListItem>
        <ListItem>
          <ListItemDecorator>
            <Box className='size-4 bg-incomplete rounded-[var(--joy-radius-sm)]' />
          </ListItemDecorator>{' '}
          Incompleto
        </ListItem>
        <ListItem>
          <ListItemDecorator>
            <PendingActionsRounded className='size-4' />
          </ListItemDecorator>{' '}
          Distribución pendiente
        </ListItem>
        {live && (
          <>
            <ListDivider inset='gutter' />
            <ListItem>
              <ListItemDecorator>
                <DownloadRounded fontSize='small' />
              </ListItemDecorator>{' '}
              Necesita descarga
            </ListItem>
            <ListItem>
              <ListItemDecorator>
                <SyncProblemRounded fontSize='small' />
              </ListItemDecorator>{' '}
              Reset counter
            </ListItem>
            <ListItem>
              <ListItemDecorator>
                <QuestionMarkRounded fontSize='small' />
              </ListItemDecorator>{' '}
              Verificar counter
            </ListItem>
            <ListItem>
              <ListItemDecorator>
                <CrisisAlertRounded fontSize='small' />
              </ListItemDecorator>{' '}
              Verificar target máq.
            </ListItem>
            <ListItem>
              <ListItemDecorator>
                <ReportRounded fontSize='small' />
              </ListItemDecorator>{' '}
              Parar máq.
            </ListItem>
            <ListItem>
              <ListItemDecorator>
                <FlagRounded fontSize='small' />
              </ListItemDecorator>{' '}
              Sin target
            </ListItem>
          </>
        )}
      </Menu>
    </Dropdown>
  );
}
