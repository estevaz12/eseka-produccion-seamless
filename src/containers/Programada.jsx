// TODO calculateNewTargets on button press, recalculate if clicked again
// TODO porcentaje as fraction

import { Box, Typography, Button } from '@mui/joy';
import InputFileUpload from '../components/InputFileUpload.jsx';
import { useEffect, useRef, useState } from 'react';
import { useConfig } from '../ConfigContext.jsx';
import DataTable from '../components/DataTable.jsx';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import NewArticuloForm from '../components/NewArticuloForm.jsx';
import ModalWrapper from '../components/ModalWrapper.jsx';

// to avoid useEffect dependency issues
let apiUrl, sqlDateFormat;

export default function Programada() {
  [apiUrl, sqlDateFormat] = [useConfig().apiUrl, useConfig().sqlDateFormat];
  // load, file upload and reading
  const [currTotal, setCurrTotal] = useState();
  const [filePath, setFilePath] = useState();
  const [programada, setProgramada] = useState();
  // diff and updates
  const [diff, setDiff] = useState();
  const [colors, setColors] = useState();
  const [newArticuloData, setNewArticuloData] = useState([]);
  const [newTargets, setNewTargets] = useState();
  // helper refs
  const diffMounted = useRef(false);
  const loadType = useRef('');

  // get current programada total on load
  useEffect(() => {
    if (localStorage.getItem('progStartDate')) {
      fetchCurrTotal();
    }
  }, []);

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
    if (filePath) {
      const params = new URLSearchParams({ path: filePath }).toString();
      fetch(`${apiUrl}/programada/file?${params}`)
        .then((res) => res.json())
        .then((data) => setProgramada(data))
        .catch((err) => console.error('[CLIENT] Error fetching data:', err));
    }
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
          startDate: localStorage.getItem('progStartDate'),
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
    let prevArticulo; // to avoid duplicate fetches

    // GET colors for form
    if (diff.added.length > 0) {
      try {
        const res = await fetch(`${apiUrl}/colors`);
        const data = await res.json();
        setColors(data);
      } catch (err) {
        console.error('[CLIENT] Error fetching /colors:', err);
      }
    }

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
              colorCodes: null,
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
            fetch(`${apiUrl}/articulo/${articulo[0].Articulo}/colorCodes`)
              .then((res) => res.json())
              .catch((err) =>
                console.error('[CLIENT] Error fetching colorCodes:', err)
              ),
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
                colorCodes: colorCodes?.length > 0 ? colorCodes : null,
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

  // TODO: add fetch cancel to all useEffects
  // Insert diff updates after validating new articulos
  useEffect(() => {
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
        fetchNewTargets(data);
      } catch (err) {
        console.error('[CLIENT] Error fetching data:', err);
      }
    }

    // inserts the whole programada
    // used for initial load at month start
    function insertAll() {
      if (programada) {
        fetch(`${apiUrl}/programada/insertAll`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(programada.rows),
        }).catch((err) => {
          console.error('[CLIENT] Error fetching data:', err);
        });
      }
    }

    if (diff && !diffMounted.current) {
      diffMounted.current = true;
      return; // skip when diff is first set to not auto-insert updates
    }

    // need to check both diff.added and newArticuloData because one could be
    // empty while the other isn't
    if (diff && diff.added.length === 0 && newArticuloData.length === 0) {
      if (loadType.current === 'update') insertUpdates();
      else if (loadType.current === 'insert') {
        insertAll();
        localStorage.setItem('progStartDate', dayjs().format(sqlDateFormat));
      }
      fetchCurrTotal();
      setDiff();
    }
  }, [diff, newArticuloData, programada]);

  function fetchCurrTotal() {
    fetch(`${apiUrl}/programada/total/${localStorage.getItem('progStartDate')}`)
      .then((res) => res.json())
      .then((data) => setCurrTotal(data[0].Total)) // single-record object
      .catch((err) => console.error('[CLIENT] Error fetching data:', err));
  }

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
        {currTotal !== undefined
          ? currTotal
          : localStorage.getItem('progStartDate')
          ? 'Cargando...'
          : 0}
      </Typography>
      <InputFileUpload onClick={handleUpload} />
      <Typography>File path: {filePath}</Typography>

      <DatePicker
        label='Fecha de inicio'
        value={
          localStorage.getItem('progStartDate')
            ? dayjs(localStorage.getItem('progStartDate'))
            : null
        }
        onChange={(newValue) => {
          if (newValue) {
            localStorage.setItem(
              'progStartDate',
              newValue.format(sqlDateFormat)
            );
            fetchCurrTotal();
          }
        }}
        disableFuture
        disabled={localStorage.getItem('progStartDate') !== null}
      />

      {programada && !diff && !newTargets && (
        <Button
          onClick={handleCompare}
          // can compare only if there is reference date
          disabled={localStorage.getItem('progStartDate') === null}
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
              disabled={localStorage.getItem('progStartDate') === null}
              onClick={() => {
                localStorage.removeItem('progStartDate');
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
              disabled={localStorage.getItem('progStartDate') === null}
            >
              Cargar cambios
            </Button>

            <Button
              onClick={() => {
                loadType.current = 'insert';
                handleProgramadaUpdate();
              }}
              disabled={localStorage.getItem('progStartDate') !== null}
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
            colors={colors}
            setNewArticuloData={setNewArticuloData}
          />
        </ModalWrapper>
      )}
    </Box>
  );
}
