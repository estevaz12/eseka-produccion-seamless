import HomeRounded from '@mui/icons-material/HomeRounded';
import FactoryTwoTone from '@mui/icons-material/FactoryTwoTone';
import HistoryRounded from '@mui/icons-material/HistoryRounded';
import PrecisionManufacturingTwoTone from '@mui/icons-material/PrecisionManufacturingTwoTone';
import TableChartTwoTone from '@mui/icons-material/TableChartTwoTone';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import ListSubheader from '@mui/joy/ListSubheader';
import { Link, NavLink, useNavigate } from 'react-router';
import Option from '@mui/joy/Option';
import Select from '@mui/joy/Select';
import ListDivider from '@mui/joy/ListDivider';

let navItems = [
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

export default function NavBar({ room, setRoom }) {
  const navigate = useNavigate();

  if (room === 'ELECTRONICA')
    navItems = [
      {
        title: 'Herramientas',
        items: [
          {
            to: '/maquinas',
            icon: <PrecisionManufacturingTwoTone />,
            label: 'Máquinas',
          },
        ],
      },
    ];

  return (
    <nav className='h-full w-full bg-neutral-100 [&_.Mui-selected]:bg-neutral-300 [&_.MuiListItemButton-root]:not-[.Mui-selected]:hover:bg-neutral-200'>
      {/* nav list */}
      <List>
        {/* select room */}
        <ListItem className='w-full'>
          <Select
            value={room}
            onChange={(e, val) => {
              setRoom(val);
              if (val === 'ELECTRONICA') navigate('/maquinas');
            }}
            className='w-full'
            disabled
          >
            <Option value='HOMBRE'>Algodón</Option>
          </Select>
        </ListItem>

        <ListDivider />

        {/* Pages */}
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
