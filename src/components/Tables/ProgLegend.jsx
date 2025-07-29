import {
  DownloadRounded,
  ListAltRounded,
  QuestionMarkRounded,
  SyncProblemRounded,
} from '@mui/icons-material';
import {
  Box,
  Dropdown,
  ListDivider,
  ListItem,
  ListItemDecorator,
  Menu,
  MenuButton,
} from '@mui/joy';

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
            <Box className='size-4 bg-white border border-neutral-400 rounded-[var(--joy-radius-sm)]' />
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
          </>
        )}
      </Menu>
    </Dropdown>
  );
}
