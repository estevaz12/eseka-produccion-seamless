import Box from '@mui/joy/Box';
import Skeleton from '@mui/joy/Skeleton';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { useMemo, useState } from 'react';
import { isProducing } from '../utils/maquinasUtils';
import { Card } from '@mui/joy';
import { useOutletContext } from 'react-router';
import MachineInfo from './MachineInfo.jsx';

export default function MaquinasMap({ machines, selectedRooms }) {
  const { room } = useOutletContext();
  const [open, setOpened] = useState(0);
  const groups = rooms[room];

  // Precompute all group data in one memo
  const groupData = useMemo(() => {
    return groups.map((group) => {
      const groupMachs = machines.filter(
        (m) => m.MachCode >= group.min && m.MachCode <= group.max
      );

      const loadingMachs =
        room === 'ELECTRONICA' && !selectedRooms[group.room]
          ? []
          : Array.from({ length: group.max - group.min + 1 }, (_, i) => ({
              MachCode: group.min + i,
            }));

      const orderedMachs = [...groupMachs].sort((a, b) => {
        if (group.oddFirst) {
          if (a.MachCode % 2 !== 0 && b.MachCode % 2 === 0) return -1;
          if (a.MachCode % 2 === 0 && b.MachCode % 2 !== 0) return 1;
        } else if (group.oddFirst === false) {
          if (a.MachCode % 2 === 0 && b.MachCode % 2 !== 0) return -1;
          if (a.MachCode % 2 !== 0 && b.MachCode % 2 === 0) return 1;
        }

        return group.reversed
          ? b.MachCode - a.MachCode
          : a.MachCode - b.MachCode;
      });

      return {
        group,
        loadingMachs,
        orderedMachs,
      };
    });
  }, [groups, machines]);

  return (
    <>
      <Box className='grid grid-cols-2 gap-4 pb-24 size-full'>
        {groupData.map(({ group, loadingMachs, orderedMachs }) => {
          const cols = Math.ceil((group.max - group.min + 1) / 2);

          // if room not selected, skip rendering
          if (orderedMachs.length === 0 && loadingMachs.length === 0)
            return null;

          return (
            <Stack
              direction='column'
              className={`gap-2 ${
                !(
                  (group.min >= 166 && group.max <= 194) ||
                  (group.min >= 301 && group.max <= 450)
                )
                  ? 'col-span-2'
                  : ''
              }`}
              key={group.min}
            >
              <Typography level='h4'>
                {room === 'ELECTRONICA' && (
                  <>
                    {group.room === 0
                      ? 'ALG'
                      : group.room === 1
                      ? 'SEA'
                      : 'NYL'}
                    &nbsp;&nbsp;&nbsp;
                  </>
                )}
                {`${group.min} - ${group.max}`}
              </Typography>

              <Box className={`grid gap-2 ${gridColsMap[cols]}`}>
                {[...(machines.length === 0 ? loadingMachs : orderedMachs)].map(
                  (m) => (
                    <MachineInfo
                      key={m.MachCode}
                      mach={m}
                      open={open}
                      setOpened={setOpened}
                      machines={machines}
                    />
                  )
                )}

                {/* filler for seamless */}
                {group.min === 1001 && (
                  <Box className='col-1 row-2 size-full' />
                )}
              </Box>
            </Stack>
          );
        })}
      </Box>

      <Card
        color='primary'
        variant='soft'
        className='fixed z-10 bottom-4 right-4 left-44'
        sx={{ boxShadow: 'sm' }}
      >
        <Stack direction='row' className='items-center justify-between gap-4'>
          {[
            ['Máquinas: ', machines.length],
            ['Tejiendo: ', machines.filter((m) => m.State === 0).length],
            [
              'Stop General: ',
              machines.filter((m) => isProducing(m) && m.State !== 0).length,
            ],
            [
              'Paradas: ',
              machines.filter(
                (m) => !isProducing(m) && ![1, 13, 56, 65535].includes(m.State)
              ).length,
            ],
            [
              'Apagadas: ',
              machines.filter((m) => [1, 13, 56, 65535].includes(m.State))
                .length,
            ],
          ].map(([label, value]) => (
            <Typography key={label}>
              <Typography level='title-lg'>{label}</Typography>
              <Typography
                level='body-lg'
                variant='outlined'
                className='bg-white rounded-md'
              >
                <Skeleton loading={machines.length === 0}>
                  {machines.length === 0 ? '00' : value}
                </Skeleton>
              </Typography>
            </Typography>
          ))}
        </Stack>
      </Card>
    </>
  );
}

const rooms = {
  MUJER: [
    { min: 1, max: 45, oddFirst: null, reversed: false },
    { min: 46, max: 89, oddFirst: null, reversed: false },
    { min: 90, max: 128, oddFirst: null, reversed: false },
    { min: 129, max: 165, oddFirst: null, reversed: false },
    { min: 166, max: 174, oddFirst: null, reversed: false },
    { min: 175, max: 194, oddFirst: null, reversed: false },
  ],
  HOMBRE: [
    { min: 389, max: 408, oddFirst: false, reversed: false },
    { min: 409, max: 428, oddFirst: false, reversed: false },
    { min: 367, max: 388, oddFirst: false, reversed: true },
    { min: 345, max: 366, oddFirst: false, reversed: true },
    { min: 301, max: 322, oddFirst: false, reversed: false },
    { min: 323, max: 344, oddFirst: false, reversed: false },
    { min: 429, max: 450, oddFirst: true, reversed: false },
  ],
  SEAMLESS: [{ min: 1001, max: 1037, oddFirst: true, reversed: true }],
  // room = 0: algodón, 1: seamless, 2: nylon
  ELECTRONICA: [
    { min: 389, max: 408, oddFirst: false, reversed: false, room: 0 },
    { min: 409, max: 428, oddFirst: false, reversed: false, room: 0 },
    { min: 367, max: 388, oddFirst: false, reversed: true, room: 0 },
    { min: 345, max: 366, oddFirst: false, reversed: true, room: 0 },
    { min: 301, max: 322, oddFirst: false, reversed: false, room: 0 },
    { min: 323, max: 344, oddFirst: false, reversed: false, room: 0 },
    { min: 429, max: 450, oddFirst: true, reversed: false, room: 0 },
    { min: 1001, max: 1037, oddFirst: true, reversed: true, room: 1 },
    { min: 1, max: 45, oddFirst: null, reversed: false, room: 2 },
    { min: 46, max: 89, oddFirst: null, reversed: false, room: 2 },
    { min: 90, max: 128, oddFirst: null, reversed: false, room: 2 },
    { min: 129, max: 165, oddFirst: null, reversed: false, room: 2 },
    { min: 166, max: 174, oddFirst: null, reversed: false, room: 2 },
    { min: 175, max: 194, oddFirst: null, reversed: false, room: 2 },
  ],
};

const gridColsMap = {
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  10: 'grid-cols-10',
  11: 'grid-cols-11',
  15: 'grid-cols-15',
  19: 'grid-cols-19',
  20: 'grid-cols-20',
  22: 'grid-cols-22',
  23: 'grid-cols-23',
};
