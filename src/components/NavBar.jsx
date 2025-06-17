import { List, ListItem, ListItemButton, ListSubheader } from '@mui/joy';
import { NavLink } from 'react-router';

export default function NavBar() {
  return (
    <nav>
      <List>
        <ListItem nested>
          <ListSubheader>Programada</ListSubheader>
          <List>
            <ListItem>
              <NavLink to='/'>
                {({ isActive }) => (
                  <ListItemButton selected={isActive}>Actual</ListItemButton>
                )}
              </NavLink>
            </ListItem>
            <ListItem>
              <NavLink to='/programada/comparar'>
                {({ isActive }) => (
                  <ListItemButton selected={isActive}>
                    Comparar y cargar
                  </ListItemButton>
                )}
              </NavLink>
            </ListItem>
            <ListItem>
              <NavLink to='/programada/anteriores'>
                {({ isActive }) => (
                  <ListItemButton selected={isActive}>
                    Anteriores
                  </ListItemButton>
                )}
              </NavLink>
            </ListItem>
          </List>
        </ListItem>
        <ListItem nested>
          <ListSubheader>Producción</ListSubheader>
          <List>
            <ListItem>
              <NavLink to='/produccion'>
                {({ isActive }) => (
                  <ListItemButton selected={isActive}>Búsqueda</ListItemButton>
                )}
              </NavLink>
            </ListItem>
          </List>
        </ListItem>
      </List>
    </nav>
  );
}
