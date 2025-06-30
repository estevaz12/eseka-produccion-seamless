import { Box, Typography, Button } from '@mui/joy';
import InputFileUpload from '../components/InputFileUpload.jsx';
import { useEffect, useRef, useState } from 'react';
import { useConfig } from '../ConfigContext.jsx';
import DataTable from '../components/DataTable.jsx';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import NewArticuloForm from '../components/NewArticuloForm.jsx';
import ModalWrapper from '../components/ModalWrapper.jsx';
import { useOutletContext } from 'react-router';

// to avoid useEffect dependency issues
let apiUrl, sqlDateFormat;

export default function ProgComparar() {
  // context
  [apiUrl, sqlDateFormat] = [useConfig().apiUrl, useConfig().sqlDateFormat];
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
    } else if (startDate) {
      // fetch total of current programada
      fetch(`${apiUrl}/programada/total/${startDate}`)
        .then((res) => res.json())
        .then((data) => {
          if (!ignore) setCurrTotal(data[0].Total);
        })
        .catch((err) =>
          console.error('[CLIENT] Error fetching /programada/total:', err)
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
    // Leaving code in case its needed in the future.

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
          // ask for Tipo, ColorDistr, ColorCodes
          setNewArticuloData((prev) => [
            ...prev,
            {
              articuloExists: false, // to know if an articulo insert is needed
              articulo: row.articulo,
              tipo: null,
              colorDistr: null,
              // colorCodes: null,
            },
          ]);
        } else {
          // If articulo exists, check if color codes and color distr exists
          const [colorDistr, colorCodes] = await Promise.all([
            fetch(`${apiUrl}/articulo/${articulo[0].Articulo}/colorDistr`)
              .then((res) => res.json())
              .catch((err) =>
                console.error('[CLIENT] Error fetching colorDistr:', err)
              ),
            // fetch(`${apiUrl}/articulo/${articulo[0].Articulo}/colorCodes`)
            //   .then((res) => res.json())
            //   .catch((err) =>
            //     console.error('[CLIENT] Error fetching colorCodes:', err)
            //   ),
          ]);

          // if color codes and color distr exist, don't add to newArticuloData
          if (!(colorDistr?.length > 0 && colorCodes?.length > 0)) {
            setNewArticuloData((prev) => [
              ...prev,
              {
                articuloExists: true, // no need to insert articulo
                articulo: articulo[0].Articulo,
                tipo: articulo[0].Tipo,
                // if undefined or length 0, results in null
                colorDistr: colorDistr?.length > 0 ? colorDistr : null,
                // colorCodes: colorCodes?.length > 0 ? colorCodes : null,
              },
            ]);
          }
        }
      } else {
        // if articulo is the same as previous, it means we are looking at a
        // different talle. Hence, we insert colorCodes for that talle
        // insert colorCodes for each talle
        // do we even need to insert color codes on this step if we're checking
        // constantly?
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
          // fetch and repeat every 30 seconds
          fetchNewTargets(data);
          intervalRef.current = setInterval(() => {
            fetchNewTargets(data);
          }, 30000); // update every 30 seconds
        } catch (err) {
          console.error('[CLIENT] Error fetching data:', err);
        }
      }

      setStartDate(dayjs().format(sqlDateFormat));
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
      // currTotal auto-updates on startDate change
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
      clearInterval(intervalRef.current);
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
    <Box>
      {/* Process:
      1. Upload programada
      2. Compare to programada in DB
      3. If updating, insert changes only in DB
      4. If resetting programada, reset date first, then insert whole programda
      */}
      <Typography>
        Total Actual:{' '}
        {currTotal !== undefined ? currTotal : startDate ? 'Cargando...' : 0}
      </Typography>
      <InputFileUpload onClick={handleUpload} />
      <Typography>File path: {filePath}</Typography>

      <DatePicker
        label='Fecha de inicio'
        value={startDate ? dayjs(startDate) : null}
        timezone='UTC'
        onChange={(newValue) => {
          if (newValue) {
            setStartDate(newValue.format(sqlDateFormat));
            // fetchCurrTotal() runs on startDate change
          }
        }}
        disableFuture
        disabled={startDate !== null}
      />

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
              disabled={startDate === null}
              onClick={() => {
                setStartDate(null);
                setCurrTotal(0); // to trigger a re-render
              }}
            >
              Reset fecha
            </Button>

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

      {programada && <Typography>Total: {programada.total}</Typography>}
      {programada && !diff && !newTargets && (
        <DataTable cols={['Artículo', 'Talle', 'A Producir']}>
          {programada.rows.map((row, i) => (
            <tr key={i}>
              <td>{row.articulo}</td>
              <td>{row.talle}</td>
              <td>{row.aProducir}</td>
            </tr>
          ))}
        </DataTable>
      )}

      {diff && (
        <Box>
          <Box>
            <Typography>Agregado</Typography>
            <DataTable cols={['Artículo', 'Talle', 'A Producir']}>
              {diff.added.map((row, i) => (
                <tr key={i}>
                  <td>{row.articulo}</td>
                  <td>{row.talle}</td>
                  <td>{row.aProducir}</td>
                </tr>
              ))}
            </DataTable>
          </Box>

          <Box>
            <Typography>Modificado</Typography>
            <DataTable cols={['Articulo', 'Talle', 'A Producir']}>
              {diff.modified.map((row, i) => (
                <tr key={i}>
                  <td>{row.articulo}</td>
                  <td>{row.talle}</td>
                  <td>{row.aProducir}</td>
                </tr>
              ))}
            </DataTable>

            <Typography>Eliminado</Typography>
            <DataTable cols={['Articulo', 'Talle', 'A Producir']}>
              {diff.deleted.map((row, i) => (
                <tr key={i}>
                  <td>{row.articulo}</td>
                  <td>{row.talle}</td>
                  <td>{row.aProducir}</td>
                </tr>
              ))}
            </DataTable>
          </Box>
        </Box>
      )}

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
        <ModalWrapper>
          <NewArticuloForm
            newArticuloData={newArticuloData[0]}
            setNewArticuloData={setNewArticuloData}
          />
        </ModalWrapper>
      )}
    </Box>
  );
}
