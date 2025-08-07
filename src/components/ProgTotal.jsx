import { Skeleton, Typography } from '@mui/joy';
import { useEffect, useState } from 'react';
import { useConfig } from '../ConfigContext.jsx';

let apiUrl;

export default function ProgTotal({ startDate, currTotal = undefined }) {
  apiUrl = useConfig().apiUrl;
  const [total, setTotal] = useState(currTotal);

  // get current programada total on load
  useEffect(() => {
    let ignore = false;

    if (currTotal !== undefined) {
      if (!ignore) setTotal(currTotal);
    } else if (startDate) {
      // fetch total of current programada
      fetch(`${apiUrl}/programada/total/${startDate}`)
        .then((res) => res.json())
        .then((data) => {
          if (!ignore) setTotal(data[0].Total);
        })
        .catch((err) =>
          console.error('[CLIENT] Error fetching /programada/total:', err)
        );
    }

    return () => {
      ignore = true;
    };
  }, [startDate, currTotal]);

  return (
    <Typography
      level='body-lg'
      className={!total && startDate && 'flex items-end gap-1'}
    >
      Total actual:{' '}
      {total !== undefined ? (
        total
      ) : startDate ? (
        <Skeleton
          animation='wave'
          variant='text'
          level='body-lg'
          width={70}
          className='inline-block pb-1'
        />
      ) : (
        0
      )}
    </Typography>
  );
}
