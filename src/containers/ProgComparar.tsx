import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import { RefObject, useContext, useEffect, useRef, useState } from 'react';
import { useConfig } from '../ConfigContext.tsx';
import dayjs from 'dayjs';
import NewArticuloForm from '../components/Forms/NewArticuloForm.jsx';
import ModalWrapper from '../components/ModalWrapper.jsx';
import { useLocation, useOutletContext } from 'react-router';
import { ToastsContext } from '../Contexts.ts';
import { localizedNum } from '../utils/numFormat.ts';
import CompareInstructions from '../components/Compare/CompareInstructions.tsx';
import DateTotalToolbar from '../components/Compare/DateTotalToolbar.jsx';
import CompareToolbar from '../components/Compare/CompareToolbar.jsx';
import FileUploadToolbar from '../components/Compare/FileUploadToolbar.jsx';
import NewProgTable from '../components/Compare/NewProgTable.jsx';
import DiffTable from '../components/Compare/DiffTable.jsx';
import NewTargetsTable from '../components/Compare/NewTargetsTable.jsx';
import {
  CompareLoadType,
  CompareProgData,
  NewArticulo,
  NewTarget,
  OutletContextType,
  PDFData,
  ProgColor,
  ToastsContextType,
} from '../types';

// to avoid useEffect dependency issues
let apiUrl: string, sqlDateFormat: string;

export default function ProgComparar() {
  // context
  ({ apiUrl, sqlDateFormat } = useConfig());
  const { room } = useOutletContext<OutletContextType>();
  const { addToast } = useContext<ToastsContextType>(ToastsContext);
  // load, file upload and reading
  const [startDate, setStartDate] = useState<string>();
  const [currTotal, setCurrTotal] = useState<number>();
  const [programada, setProgramada] = useState<PDFData>();
  // diff and updates
  const [diff, setDiff] = useState<CompareProgData | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [newArticuloData, setNewArticuloData] = useState<NewArticulo[]>([]);
  const [newTargets, setNewTargets] = useState<NewTarget[]>();
  // helper refs
  const diffMounted = useRef(false);
  const loadType = useRef<CompareLoadType | ''>('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  useIntervalCleanup(intervalRef);

  // get current programada total on load
  useEffect(() => {
    let ignore = false;
    if (startDate === undefined) {
      // fetch start date of current programada
      fetch(`${apiUrl}/${room}/programada/actualDate`)
        .then((res) => res.json())
        .then((data) => {
          if (!ignore) setStartDate(data[0].Date);
        })
        .catch((err) =>
          console.error('[CLIENT] Error fetching /programada/actualDate:', err)
        );
    }

    return () => {
      ignore = true;
    };
  }, [startDate]);

  // Insert diff updates after validating new articulos
  useEffect(() => {
    let ignore = false;

    // just inserts updates
    async function insertUpdates() {
      try {
        const res = await fetch(`${apiUrl}/${room}/programada/update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(diff),
        });

        const resData = await res.json();
        addToast({
          type: res.status === 500 ? 'danger' : 'success',
          message: resData.message,
        });

        const data: ProgColor[] = resData.inserted;
        fetchNewTargets(data);
        intervalRef.current = setInterval(() => {
          fetchNewTargets(data);
        }, 30000); // update every 30 seconds
      } catch (err) {
        console.error('[CLIENT] Error fetching data:', err);
      }

      fetch(`${apiUrl}/${room}/programada/total/${startDate}`)
        .then((res) => res.json())
        .then((data) => setCurrTotal(data[0].Total)) // single-record object
        .catch((err) => console.error('[CLIENT] Error fetching data:', err));
    }

    // inserts the whole programada
    // used for initial load at month start
    async function insertAll() {
      if (programada) {
        try {
          const res = await fetch(`${apiUrl}/${room}/programada/insertAll`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(programada.rows),
          });

          const resData = await res.json();
          addToast({
            type: res.status === 500 ? 'danger' : 'success',
            message: resData.message,
          });

          const data: ProgColor[] = resData.inserted;

          // insert programada start date to db
          fetch(`${apiUrl}/${room}/programada/insertStartDate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              date: dayjs.tz().format(sqlDateFormat),
              month: dayjs.tz().month() + 1, // month is 0-indexed in dayjs
              year: dayjs.tz().year(),
            }),
          })
            .then(async (res) => {
              const resData = await res.json();
              addToast({
                type: res.status === 500 ? 'danger' : 'success',
                message: resData.message,
              });
            })
            .catch((err) => {
              console.error('[CLIENT] Error inserting start date:', err);
            });

          // fetch and repeat every 30 seconds
          fetchNewTargets(data);
          intervalRef.current = setInterval(() => {
            fetchNewTargets(data);
          }, 30000); // update every 30 seconds

          setStartDate(dayjs.tz().format(sqlDateFormat));
          // currTotal auto-updates on startDate change
        } catch (err) {
          console.error('[CLIENT] Error fetching data:', err);
        }
      }
    }

    if (diff && !diffMounted.current) {
      diffMounted.current = true;
      return; // skip when diff is first set to not auto-insert updates
    }

    if (isResetting) {
      setIsResetting(false);
      return;
    }

    // need to check both diff.added and newArticuloData because one could be
    // empty while the other isn't
    if (
      !ignore &&
      startDate !== undefined &&
      diff &&
      diff.added.length === 0 &&
      newArticuloData.length === 0
    ) {
      if (loadType.current === 'update') {
        insertUpdates();
      } else if (loadType.current === 'insert') {
        insertAll();
      }

      setDiff(null);
    }

    return () => {
      ignore = true;
    };
  }, [diff, newArticuloData, programada, startDate, addToast]);

  function fetchNewTargets(inserted: ProgColor[]) {
    fetch(`${apiUrl}/${room}/programada/calculateNewTargets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inserted), // inserted prog updates
    })
      .then((res) => res.json())
      .then((data: NewTarget[]) =>
        setNewTargets(
          data.sort((a, b) => a.styleCode.localeCompare(b.styleCode))
        )
      )
      .catch((err) => console.error('[CLIENT] Error fetching data:', err));
  }

  function useIntervalCleanup(intervalRef: RefObject<NodeJS.Timeout>) {
    const { pathname } = useLocation();

    useEffect(() => {
      const handleUnload = () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };

      window.addEventListener('beforeunload', handleUnload);

      return () => {
        window.removeEventListener('beforeunload', handleUnload);

        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }, [pathname, intervalRef]);
  }

  return (
    <Stack direction='column' className='gap-4 py-4'>
      {/* Collapsible instructions */}
      <CompareInstructions />
      {/* buttons */}
      <Stack direction='row' className='items-end justify-between'>
        <DateTotalToolbar
          newTargets={newTargets}
          startDate={startDate}
          setStartDate={setStartDate}
          diff={diff}
          setIsResetting={setIsResetting}
          setCurrTotal={setCurrTotal}
          currTotal={currTotal}
        />

        <FileUploadToolbar
          setProgramada={setProgramada}
          setDiff={setDiff}
          setNewTargets={setNewTargets}
          diffMounted={diffMounted}
        />
      </Stack>

      {programada && (
        <Stack direction='row' className='items-center gap-4'>
          {/* New total */}
          <Typography
            variant='outlined'
            color='warning'
            level='body-lg'
            className='max-w-fit rounded-(--joy-radius-sm) py-1.5 px-4 mx-0'
          >
            Total nuevo: {localizedNum(programada.total)}
          </Typography>

          <CompareToolbar
            programada={programada}
            diff={diff}
            setDiff={setDiff}
            newTargets={newTargets}
            startDate={startDate}
            loadType={loadType}
            setNewArticuloData={setNewArticuloData}
          />
        </Stack>
      )}

      {/* New programada table */}
      {programada && !diff && !newTargets && (
        <NewProgTable programada={programada} />
      )}

      {/* diff table */}
      {diff && <DiffTable diff={diff} />}

      {newTargets && <NewTargetsTable newTargets={newTargets} />}

      {/* render one Modal at a time */}
      {newArticuloData.length > 0 && (
        <ModalWrapper
          title='Agregar artículo nuevo'
          content='Por favor, ingrese los datos del siguiente artículo.'
          handleClose={() => window.location.reload()}
          contentClassName='w-sm'
        >
          <NewArticuloForm
            newArticuloData={newArticuloData[0]}
            setNewArticuloData={setNewArticuloData}
          />
        </ModalWrapper>
      )}
    </Stack>
  );
}
