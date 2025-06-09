import { List, ListItem, ListItemButton } from '@mui/joy';
import { NavLink } from 'react-router';

export default function NavBar() {
  return (
    <nav>
      <List>
        <ListItem>
          <NavLink
            to='/'
            className={({ isActive }) =>
              isActive ? 'text-blue-600' : 'text-black'
            }
          >
            <ListItemButton>Producción</ListItemButton>
          </NavLink>
        </ListItem>
        <ListItem>
          <NavLink
            to='/programada'
            className={({ isActive }) =>
              isActive ? 'text-blue-600' : 'text-black'
            }
          >
            <ListItemButton>Programada</ListItemButton>
          </NavLink>
        </ListItem>
      </List>
    </nav>
  );
}
