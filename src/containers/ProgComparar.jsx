import {
  Typography,
  Button,
  Stack,
  List,
  ListItem,
  Card,
  IconButton,
  Box,
} from '@mui/joy';
import InputFileUpload from '../components/InputFileUpload.jsx';
import { useEffect, useRef, useState } from 'react';
import { useConfig } from '../ConfigContext.jsx';
import DataTable from '../components/DataTable.jsx';
import dayjs from 'dayjs';
import NewArticuloForm from '../components/NewArticuloForm.jsx';
import ModalWrapper from '../components/ModalWrapper.jsx';
import { useOutletContext } from 'react-router';
import { StyledDatePicker } from '../components/StyledPickers.jsx';
import ProgTotal from '../components/ProgTotal.jsx';
import { KeyboardArrowDownTwoTone } from '@mui/icons-material';

// to avoid useEffect dependency issues
let apiUrl, sqlDateFormat, stripedTableRows;

export default function ProgComparar() {
  // context
  ({ apiUrl, sqlDateFormat, stripedTableRows } = useConfig());
  const setNewColorCodes = useOutletContext();
  // load, file upload and reading
  const [startDate, setStartDate] = useState();
  const [currTotal, setCurrTotal] = useState();
  const [filePath, setFilePath] = useState();
  const [programada, setProgramada] = useState();
  // diff and updates
  const [diff, setDiff] = useState();
  const [newArticuloData, setNewArticuloData] = useState([]);
  const [newTargets, setNewTargets] = useState();
  // ui
  const [openInstr, setOpenInstr] = useState(false);
  // helper refs
  const diffMounted = useRef(false);
  const loadType = useRef('');
  const intervalRef = useRef();

  // get current programada total on load
  useEffect(() => {
    let ignore = false;
    if (startDate === undefined) {
      // fetch start date of current programada
      fetch(`${apiUrl}/programada/actualDate`)
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

  async function handleUpload() {
    // Reset states before uploading a new file
    diffMounted.current = false;
    setProgramada();
    setDiff();
    setNewTargets();
    setFilePath(await window.electronAPI.openFile());
  }

  // read programada file
  useEffect(() => {
    let ignore = false;
    if (!ignore && filePath) {
      const params = new URLSearchParams({ path: filePath }).toString();
      fetch(`${apiUrl}/programada/file?${params}`)
        .then((res) => res.json())
        .then((data) => {
          if (!ignore) setProgramada(data);
        })
        .catch((err) => console.error('[CLIENT] Error fetching data:', err));
    }

    return () => {
      ignore = true;
    };
  }, [filePath]);

  // compare new programada to old
  function handleCompare() {
    if (programada) {
      fetch(`${apiUrl}/programada/compare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: startDate,
          new: programada.rows,
        }),
      })
        .then((res) => res.json())
        .then((data) => setDiff(data))
        .catch((err) => console.error('[CLIENT] Error fetching data:', err));
    }
  }

  async function handleProgramadaUpdate() {
    // Check if articulo, color codes, and color distr exist and handle accordingly

    // colorCodes will be inserted through newColorCodes.
    // fetch newColorCodes before updating
    try {
      const res = await fetch(`${apiUrl}/machines/newColorCodes`);
      const newCodes = await res.json();
      const currCodes = JSON.parse(
        localStorage.getItem('newColorCodes') || '[]'
      );
      // Deduplicate by StyleCode.styleCode
      const uniqueNewCodes = newCodes.filter(
        (newCode) =>
          !currCodes.some(
            (curr) => curr.StyleCode.styleCode === newCode.StyleCode.styleCode
          )
      );
      const updatedCodes = [...currCodes, ...uniqueNewCodes];
      localStorage.setItem('newColorCodes', JSON.stringify(updatedCodes));
      setNewColorCodes(updatedCodes);
    } catch (err) {
      console.error('[CLIENT] Error fetching /machines/newColorCodes:', err);
    }

    let prevArticulo; // to avoid duplicate fetches

    for (const row of diff.added) {
      if (prevArticulo !== row.articulo) {
        let articulo;
        try {
          let res = await fetch(`${apiUrl}/articulo/${row.articulo}`);
          articulo = await res.json();
        } catch (err) {
          console.error('[CLIENT] Error fetching articulo:', err);
        }

        // if else to avoid making unnecessary fetches if articulo doesn't exist
        if (!articulo || articulo.length === 0) {
          // ask for Tipo, ColorDistr
          setNewArticuloData((prev) => [
            ...prev,
            {
              articuloExists: false, // to know if an articulo insert is needed
              articulo: row.articulo,
              tipo: null,
              colorDistr: null,
            },
          ]);
        } else {
          // If articulo exists, check if color distr exists
          let colorDistr;
          try {
            const res = await fetch(
              `${apiUrl}/articulo/${articulo[0].Articulo}/colorDistr`
            );
            colorDistr = await res.json();
          } catch (err) {
            console.error('[CLIENT] Error fetching colorDistr:', err);
          }

          // if color distr exists, don't add to newArticuloData
          if (!(colorDistr?.length > 0)) {
            setNewArticuloData((prev) => [
              ...prev,
              {
                articuloExists: true, // no need to insert articulo
                articulo: articulo[0].Articulo,
                tipo: articulo[0].Tipo,
                // if undefined or length 0, results in null
                colorDistr: colorDistr?.length > 0 ? colorDistr : null,
              },
            ]);
          }
        }
      }

      prevArticulo = row.articulo;
    }

    // move from added to modified to trigger useEffect after inserting new articulos
    setDiff((prev) => ({
      ...prev,
      modified: [...prev.modified, ...prev.added],
      added: [],
    }));
  }

  // Insert diff updates after validating new articulos
  useEffect(() => {
    // Always clear any previous interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    let ignore = false;

    // just inserts updates
    async function insertUpdates() {
      try {
        const res = await fetch(`${apiUrl}/programada/update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(diff),
        });
        const data = await res.json();
        // fetch and repeat every 30 seconds
        fetchNewTargets(data);
        intervalRef.current = setInterval(() => {
          fetchNewTargets(data);
        }, 30000); // update every 30 seconds
      } catch (err) {
        console.error('[CLIENT] Error fetching data:', err);
      }

      fetch(`${apiUrl}/programada/total/${startDate}`)
        .then((res) => res.json())
        .then((data) => setCurrTotal(data[0].Total)) // single-record object
        .catch((err) => console.error('[CLIENT] Error fetching data:', err));
    }

    // inserts the whole programada
    // used for initial load at month start
    async function insertAll() {
      if (programada) {
        try {
          const res = await fetch(`${apiUrl}/programada/insertAll`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(programada.rows),
          });
          const data = await res.json();
          // insert programada start date to db
          fetch(`${apiUrl}/programada/insertStartDate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              date: dayjs().format(sqlDateFormat),
              month: dayjs().month() + 1, // month is 0-indexed in dayjs
              year: dayjs().year(),
            }),
          }).catch((err) => {
            console.error('[CLIENT] Error inserting start date:', err);
          });
          // fetch and repeat every 30 seconds
          fetchNewTargets(data);
          intervalRef.current = setInterval(() => {
            fetchNewTargets(data);
          }, 30000); // update every 30 seconds

          setStartDate(dayjs().format(sqlDateFormat));
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

      setDiff();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      ignore = true;
    };
  }, [diff, newArticuloData, programada, startDate]);

  function fetchNewTargets(inserted) {
    fetch(`${apiUrl}/programada/calculateNewTargets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inserted), // inserted prog updates
    })
      .then((res) => res.json())
      .then((data) => setNewTargets(data))
      .catch((err) => console.error('[CLIENT] Error fetching data:', err));
  }

  return (
    <Stack direction='column' className='gap-4'>
      {/* Collapsible instructions */}
      <Card variant='soft' color='neutral' className='p-2 pl-8'>
        <List
          sx={{
            '--List-insetStart': '32px',
            '--ListItem-paddingY': '0px',
            '--ListItem-paddingRight': '16px',
            '--ListItem-paddingLeft': '21px',
            '--ListItem-startActionWidth': '0px',
            '--ListItem-startActionTranslateX': '-50%',
          }}
        >
          <ListItem
            nested
            className='justify-center'
            startAction={
              <IconButton
                variant='plain'
                color='neutral'
                onClick={() => setOpenInstr(!openInstr)}
              >
                <KeyboardArrowDownTwoTone
                  sx={[
                    openInstr
                      ? { transform: 'initial' }
                      : { transform: 'rotate(-90deg)' },
                  ]}
                />
              </IconButton>
            }
          >
            <Typography level='title-lg'>Instrucciones</Typography>
          </ListItem>
          {openInstr && (
            <List marker='decimal' size='sm'>
              <ListItem>
                <Typography>Cargue el PDF de la programada actual.</Typography>
              </ListItem>
              <ListItem>
                <Typography>
                  Oprima{' '}
                  <Typography variant='solid' color='primary'>
                    Comparar
                  </Typography>{' '}
                  para ver los cambios.
                </Typography>
              </ListItem>
              <ListItem>
                <Typography>
                  Para cargar los cambios, oprima{' '}
                  <Typography variant='solid' color='primary'>
                    Cargar cambios
                  </Typography>
                </Typography>
              </ListItem>
              <ListItem>
                <Typography>
                  Para cargar programada nueva del mes, oprima{' '}
                  <Typography variant='solid' color='primary'>
                    Reset
                  </Typography>{' '}
                  y luego{' '}
                  <Typography variant='solid' color='primary'>
                    Cargar todo
                  </Typography>
                </Typography>
              </ListItem>
            </List>
          )}
        </List>
      </Card>
      {/* buttons */}
      <Stack direction='row' className='items-end justify-between gap-4'>
        <Stack direction='row' className='items-end gap-2'>
          <StyledDatePicker
            label='Fecha de inicio'
            value={startDate ? dayjs(startDate) : null}
            timezone='UTC'
            onChange={(newValue) => {
              if (newValue) {
                setStartDate(newValue.format(sqlDateFormat));
                // fetchCurrTotal() runs on startDate change
              }
            }}
            disabled
            className='max-w-[150px]'
          />

          <Button
            disabled={
              !(
                diff &&
                !(
                  diff.added.length === 0 &&
                  diff.modified.length === 0 &&
                  diff.deleted.length === 0
                )
              ) || startDate === null
            }
            onClick={() => {
              setStartDate(null);
              setCurrTotal(0); // to trigger a re-render
            }}
          >
            Reset
          </Button>
        </Stack>

        <Stack direction='row' className='items-end justify-between w-md'>
          <ProgTotal startDate={startDate} currTotal={currTotal} />

          {programada && !diff && !newTargets && (
            <Button
              onClick={handleCompare}
              // can compare only if there is reference date
              disabled={startDate === null}
            >
              Comparar
            </Button>
          )}

          {diff &&
            !(
              diff.added.length === 0 &&
              diff.modified.length === 0 &&
              diff.deleted.length === 0
            ) && (
              <>
                <Button
                  onClick={() => {
                    loadType.current = 'update';
                    handleProgramadaUpdate();
                  }}
                  disabled={startDate === null}
                >
                  Cargar cambios
                </Button>

                <Button
                  onClick={() => {
                    loadType.current = 'insert';
                    handleProgramadaUpdate();
                  }}
                  disabled={startDate !== null}
                >
                  Cargar todo
                </Button>
              </>
            )}
        </Stack>

        <Stack direction='row' className='gap-2'>
          <Typography
            variant='outlined'
            color='neutral'
            noWrap
            className='rounded-[var(--joy-radius-sm)] w-56 py-1.5 px-4 mx-0'
          >
            Archivo:{' '}
            {filePath
              ? filePath.slice(
                  Math.max(
                    filePath.lastIndexOf('/'),
                    filePath.lastIndexOf('\\')
                  )
                )
              : '(.pdf)'}
          </Typography>
          <InputFileUpload onClick={handleUpload} />
        </Stack>
      </Stack>
      {/* data */}
      {programada && (
        <Typography
          variant='outlined'
          color='warning'
          level='body-lg'
          className='max-w-fit rounded-[var(--joy-radius-sm)] py-1.5 px-4 mx-0'
        >
          Total nuevo: {programada.total}
        </Typography>
      )}
      {/* New programada table */}
      {programada && !diff && !newTargets && (
        <DataTable
          cols={['Artículo', 'Talle', 'A Producir']}
          className={stripedTableRows}
        >
          {programada.rows.map((row, i) => (
            <tr key={i}>
              <td>{row.articulo}</td>
              <td>{row.talle}</td>
              <td>{row.aProducir}</td>
            </tr>
          ))}
        </DataTable>
      )}

      {/* diff table */}
      {diff &&
        (() => {
          const maxLen = Math.max(
            diff.added.length,
            diff.modified.length,
            diff.deleted.length
          );
          const pad = (arr) => {
            if (arr.length < maxLen) {
              return arr.concat(
                Array.from({ length: maxLen - arr.length }, () => ({
                  articulo: '',
                  talle: '',
                  aProducir: '',
                }))
              );
            } else {
              return arr;
            }
          };

          const added = pad(diff.added);
          const modified = pad(diff.modified);
          const deleted = pad(diff.deleted);

          return (
            <Stack
              direction='row'
              className='items-start justify-between gap-4'
            >
              <Box className='overflow-auto max-h-[440px]'>
                <DataTable
                  cols={['Artículo', 'Talle', 'A Producir']}
                  className={stripedTableRows}
                  titleHeader='Agregado'
                  titleHeaderColor='bg-[var(--joy-palette-success-softBg)]'
                >
                  {added.map((row, i) => (
                    <tr key={i}>
                      <td>{row.articulo}</td>
                      <td>{row.talle}</td>
                      <td>{row.aProducir}</td>
                    </tr>
                  ))}
                </DataTable>
              </Box>

              <Box className='overflow-auto max-h-[440px]'>
                <DataTable
                  cols={['Articulo', 'Talle', 'A Producir']}
                  className={stripedTableRows}
                  titleHeader='Modificado'
                  titleHeaderColor='bg-[var(--joy-palette-warning-softBg)]'
                >
                  {modified.map((row, i) => (
                    <tr key={i}>
                      <td>{row.articulo}</td>
                      <td>{row.talle}</td>
                      <td>{row.aProducir}</td>
                    </tr>
                  ))}
                </DataTable>
              </Box>

              <Box className='overflow-auto max-h-[440px]'>
                <DataTable
                  cols={['Articulo', 'Talle', 'A Producir']}
                  className={stripedTableRows}
                  titleHeader='Eliminado'
                  titleHeaderColor='bg-[var(--joy-palette-danger-softBg)]'
                >
                  {deleted.map((row, i) => (
                    <tr key={i}>
                      <td>{row.articulo}</td>
                      <td>{row.talle}</td>
                      <td>{row.aProducir}</td>
                    </tr>
                  ))}
                </DataTable>
              </Box>
            </Stack>
          );
        })()}

      {newTargets && (
        <DataTable
          cols={[
            'Máquina',
            'StyleCode',
            'MachTarget',
            'ProgTarget Previo',
            'ProgTarget Nuevo',
            'Producción Mes',
            'MachPieces',
            'Enviar Target',
          ]}
          className={stripedTableRows}
        >
          {newTargets.map((row, i) => (
            <tr key={i}>
              <td>{row.machCode}</td>
              <td>{row.styleCode}</td>
              <td>{row.machTarget}</td>
              <td>{row.prevProgTarget}</td>
              <td>{row.newProgTarget}</td>
              <td>{row.monthProduction}</td>
              <td>{row.machPieces}</td>
              <td>{row.sendTarget}</td>
            </tr>
          ))}
        </DataTable>
      )}

      {/* render one Modal at a time */}
      {newArticuloData.length > 0 && (
        <ModalWrapper
          title='Agregar artículo nuevo'
          content='Por favor, ingrese los datos del siguiente artículo.'
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
