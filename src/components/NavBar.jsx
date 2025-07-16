import {
  CompareArrowsTwoTone,
  FactoryTwoTone,
  HistoryTwoTone,
  PrecisionManufacturingTwoTone,
  TableChartTwoTone,
} from '@mui/icons-material';
import { List, ListItem, ListItemButton, ListSubheader } from '@mui/joy';
import { NavLink } from 'react-router';

export default function NavBar() {
  return (
    <nav className='h-full w-full bg-neutral-100 [&_.Mui-selected]:bg-neutral-300 [&_.MuiListItemButton-root]:not-[.Mui-selected]:hover:bg-neutral-200'>
      <List className=''>
        <ListItem nested>
          <ListSubheader>Programada</ListSubheader>
          <List>
            <NavLink to='/'>
              {({ isActive }) => (
                <ListItem>
                  <ListItemButton selected={isActive}>
                    <TableChartTwoTone />
                    Actual
                  </ListItemButton>
                </ListItem>
              )}
            </NavLink>
            <NavLink to='/programada/anteriores'>
              {({ isActive }) => (
                <ListItem>
                  <ListItemButton selected={isActive}>
                    <HistoryTwoTone />
                    Anteriores
                  </ListItemButton>
                </ListItem>
              )}
            </NavLink>
            <NavLink to='/programada/comparar'>
              {({ isActive }) => (
                <ListItem>
                  <ListItemButton selected={isActive}>
                    <CompareArrowsTwoTone />
                    Comparar
                  </ListItemButton>
                </ListItem>
              )}
            </NavLink>
          </List>
        </ListItem>
        <ListItem nested>
          <ListSubheader>Herramientas</ListSubheader>
          <List>
            <NavLink to='/produccion'>
              {({ isActive }) => (
                <ListItem>
                  <ListItemButton selected={isActive}>
                    <FactoryTwoTone />
                    Producción
                  </ListItemButton>
                </ListItem>
              )}
            </NavLink>
            <NavLink to='/maquinas'>
              {({ isActive }) => (
                <ListItem>
                  <ListItemButton selected={isActive}>
                    <PrecisionManufacturingTwoTone />
                    Máquinas
                  </ListItemButton>
                </ListItem>
              )}
            </NavLink>
          </List>
        </ListItem>
      </List>
    </nav>
  );
}
