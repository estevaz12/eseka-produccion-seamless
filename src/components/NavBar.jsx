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
    <nav className=''>
      <List>
        <ListItem nested>
          <ListSubheader>Programada</ListSubheader>
          <List>
            <ListItem>
              <NavLink to='/'>
                {({ isActive }) => (
                  <ListItemButton selected={isActive}>
                    <TableChartTwoTone />
                    Actual
                  </ListItemButton>
                )}
              </NavLink>
            </ListItem>
            <ListItem>
              <NavLink to='/programada/comparar'>
                {({ isActive }) => (
                  <ListItemButton selected={isActive}>
                    <CompareArrowsTwoTone />
                    Comparar
                  </ListItemButton>
                )}
              </NavLink>
            </ListItem>
            <ListItem>
              <NavLink to='/programada/anteriores'>
                {({ isActive }) => (
                  <ListItemButton selected={isActive}>
                    <HistoryTwoTone />
                    Anteriores
                  </ListItemButton>
                )}
              </NavLink>
            </ListItem>
          </List>
        </ListItem>
        <ListItem nested>
          <ListSubheader>Herramientas</ListSubheader>
          <List>
            <ListItem>
              <NavLink to='/produccion'>
                {({ isActive }) => (
                  <ListItemButton selected={isActive}>
                    <FactoryTwoTone />
                    Producción
                  </ListItemButton>
                )}
              </NavLink>
            </ListItem>
            <ListItem>
              <NavLink to='/maquinas'>
                {({ isActive }) => (
                  <ListItemButton selected={isActive}>
                    <PrecisionManufacturingTwoTone />
                    Máquinas
                  </ListItemButton>
                )}
              </NavLink>
            </ListItem>
          </List>
        </ListItem>
      </List>
    </nav>
  );
}
