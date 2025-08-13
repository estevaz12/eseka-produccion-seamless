import { useEffect, useState } from 'react';
import { useConfig } from '../ConfigContext.jsx';
import Box from '@mui/joy/Box';
import Stack from '@mui/joy/Stack';
import RefreshBtn from '../components/RefreshBtn.jsx';
import EnhancedTable from '../components/Tables/EnhancedTable.jsx';

let apiUrl;

export default function Maquinas() {
  apiUrl = useConfig().apiUrl;
  const [machines, setMachines] = useState([]);

  const getMachines = () => {
    fetch(`${apiUrl}/machines`)
      .then((res) => res.json())
      .then((data) => setMachines(data))
      .catch((err) => console.error('[CLIENT] Error fetching /machines:', err));
  };

  // get machines on load
  useEffect(() => {
    let ignore = false;
    if (!ignore) getMachines();

    return () => {
      ignore = true;
    };
  }, []);

  const cols = [
    {
      id: 'MachCode',
      label: 'Máquina',
      align: 'center',
    },
    {
      id: 'StyleCode',
      label: 'Cadena',
      align: 'center',
    },
    {
      id: 'Pieces',
      label: 'Un. Producidas',
      align: 'right',
    },
    {
      id: 'TargetOrder',
      label: 'Target',
      align: 'right',
    },
    {
      id: 'IdealCycle',
      label: 'Ciclo Ideal',
      align: 'right',
    },
    {
      id: 'WorkEfficiency',
      label: 'Eff. %',
      align: 'right',
    },
    {
      id: 'State',
      label: 'Estado',
      align: 'center',
    },
  ];

  function renderRow(row, i, opened, handleClick) {
    return [
      null,
      <>
        <td align='center'>{row.MachCode}</td>
        <td align='center'>{row.StyleCode.substring(0, 8)}</td>
        <td align='right'>{row.Pieces}</td>
        <td align='right'>{row.TargetOrder}</td>
        <td align='right'>{row.IdealCycle}</td>
        <td align='right'>{row.WorkEfficiency}%</td>
        <td align='center'>{row.State}</td>
      </>,
    ];
  }

  return (
    <Box>
      <Stack
        direction='row'
        className='sticky z-10 items-end justify-between gap-4 top-0 bg-[var(--joy-palette-background-body)] py-4'
      >
        <RefreshBtn handleRefresh={getMachines} />

        {/* search inputs */}
      </Stack>

      <EnhancedTable
        cols={cols}
        rows={machines}
        renderRow={renderRow}
        initOrder='asc'
        initOrderBy='MachCode'
        headerTop='top-[68px]'
      />
    </Box>
  );
}
