import HomeRounded from '@mui/icons-material/HomeRounded';
import CompareArrowsRounded from '@mui/icons-material/CompareArrowsRounded';
import FactoryTwoTone from '@mui/icons-material/FactoryTwoTone';
import HistoryRounded from '@mui/icons-material/HistoryRounded';
import PrecisionManufacturingTwoTone from '@mui/icons-material/PrecisionManufacturingTwoTone';
import TableChartTwoTone from '@mui/icons-material/TableChartTwoTone';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import ListSubheader from '@mui/joy/ListSubheader';
import { NavLink } from 'react-router';

const navItems = [
  {
    title: 'Inicio',
    items: [
      {
        to: '/',
        icon: <HomeRounded />,
        label: 'Inicio',
      },
    ],
  },
  {
    title: 'Programada',
    items: [
      {
        to: '/programada/actual',
        icon: <TableChartTwoTone />,
        label: 'Actual',
      },
      {
        to: '/programada/anteriores',
        icon: <HistoryRounded />,
        label: 'Anteriores',
      },
      {
        to: '/programada/comparar',
        icon: <CompareArrowsRounded />,
        label: 'Comparar',
      },
    ],
  },
  {
    title: 'Herramientas',
    items: [
      { to: '/produccion', icon: <FactoryTwoTone />, label: 'Producción' },
      {
        to: '/maquinas',
        icon: <PrecisionManufacturingTwoTone />,
        label: 'Máquinas',
      },
    ],
  },
];

export default function NavBar() {
  return (
    <nav className='h-full w-full bg-neutral-100 [&_.Mui-selected]:bg-neutral-300 [&_.MuiListItemButton-root]:not-[.Mui-selected]:hover:bg-neutral-200'>
      {/* nav list */}
      <List>
        {navItems.map((group) => (
          <ListItem key={group.title} nested>
            {group.title !== 'Inicio' && (
              <ListSubheader className='font-bold'>{group.title}</ListSubheader>
            )}
            <List>
              {group.items.map((item) => (
                <NavLink key={item.to} to={item.to}>
                  {({ isActive }) => (
                    <ListItem>
                      <ListItemButton selected={isActive}>
                        {item.icon}
                        {item.label}
                      </ListItemButton>
                    </ListItem>
                  )}
                </NavLink>
              ))}
            </List>
          </ListItem>
        ))}
      </List>
    </nav>
  );
}
