import Skeleton from '@mui/joy/Skeleton';
import Typography from '@mui/joy/Typography';
import { useEffect, useState } from 'react';
import { useConfig } from '../ConfigContext.jsx';
import { useOutletContext } from 'react-router';
import localizedNum from '../utils/numFormat.js';

let apiUrl;

export default function ProgTotal({ startDate, currTotal = undefined }) {
  apiUrl = useConfig().apiUrl;
  const { room } = useOutletContext();
  const [total, setTotal] = useState(currTotal);

  // get current programada total on load
  useEffect(() => {
    let ignore = false;

    if (currTotal !== undefined) {
      if (!ignore) setTotal(currTotal);
    } else if (startDate) {
      // fetch total of current programada
      fetch(`${apiUrl}/${room}/programada/total/${startDate}`)
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
        localizedNum(total)
      ) : startDate ? (
        <Skeleton
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
