import { List, ListItem, ListItemButton, ListSubheader } from '@mui/joy';
import { useState } from 'react';
import { NavLink } from 'react-router';

export default function NavBar() {
  const [selected, setSelected] = useState('');
  return (
    <nav>
      <List>
        <ListItem nested>
          <ListSubheader>Producción Programada</ListSubheader>
          <List>
            <ListItem>
              <NavLink
                to='/programada'
                className={({ isActive }) =>
                  isActive && setSelected('progActual')
                }
              >
                <ListItemButton selected={selected === 'progActual'}>
                  Actual
                </ListItemButton>
              </NavLink>
            </ListItem>
            <ListItem>
              <NavLink
                to='/programada/comparar'
                className={({ isActive }) =>
                  isActive && setSelected('progComparar')
                }
              >
                <ListItemButton selected={selected === 'progComparar'}>
                  Comparar y cargar
                </ListItemButton>
              </NavLink>
            </ListItem>
            <ListItem>
              <NavLink
                to='/programada/historica'
                className={({ isActive }) =>
                  isActive && setSelected('progHistorica')
                }
              >
                <ListItemButton selected={selected === 'progHistorica'}>
                  Histórica
                </ListItemButton>
              </NavLink>
            </ListItem>
          </List>
        </ListItem>
        <ListItem nested>
          <ListSubheader>Producción</ListSubheader>
          <List>
            <ListItem>
              <NavLink
                to='/produccion'
                className={({ isActive }) =>
                  isActive && setSelected('produccion')
                }
              >
                <ListItemButton selected={selected === 'produccion'}>
                  Búsqueda avanzada
                </ListItemButton>
              </NavLink>
            </ListItem>
          </List>
        </ListItem>
      </List>
    </nav>
  );
}
