import { List, ListItem, ListItemButton } from '@mui/joy';
import { NavLink } from 'react-router';

export default function NavBar() {
  return (
    <nav>
      <List>
        <ListItem>
          <ListItemButton>
            <NavLink
              to='/'
              className={({ isActive }) =>
                isActive ? 'text-blue-600' : 'text-black'
              }
            >
              Producción
            </NavLink>
          </ListItemButton>
        </ListItem>
        <ListItem>
          <ListItemButton>
            <NavLink
              to='/programada'
              className={({ isActive }) =>
                isActive ? 'text-blue-600' : 'text-black'
              }
            >
              Programada
            </NavLink>
          </ListItemButton>
        </ListItem>
      </List>
    </nav>
  );
}
