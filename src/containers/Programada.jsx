import { Box, Typography, Button } from '@mui/joy';
import InputFileUpload from '../components/InputFileUpload.jsx';
import { useEffect, useState } from 'react';
import { useConfig } from '../ConfigContext.jsx';
import DataTable from '../components/DataTable.jsx';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

export default function Programada() {
  const { apiUrl, sqlDateFormat } = useConfig();
  const [currTotal, setCurrTotal] = useState();
  const [filePath, setFilePath] = useState();
  const [programada, setProgramada] = useState();
  const [diff, setDiff] = useState();
  const [newTargets, setNewTargets] = useState();

  useEffect(() => {
    if (localStorage.getItem('progStartDate')) {
      fetchCurrTotal();
    }
  }, []);

  useEffect(() => {
    if (filePath) {
      const params = new URLSearchParams({ path: filePath }).toString();
      fetch(`${apiUrl}/programada/file?${params}`)
        .then((res) => res.json())
        .then((data) => setProgramada(data))
        .catch((err) => console.log('[CLIENT] Error fetching data:', err));
    }
  }, [filePath]);

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
        .catch((err) => console.log('[CLIENT] Error fetching data:', err));
    }
  }

  function handleInsertAll() {
    if (programada) {
      fetch(`${apiUrl}/programada/insertAll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(programada.rows),
      }).catch((err) => console.log('[CLIENT] Error fetching data:', err));
    }
  }

  function handleProgramadaUpdate() {
    if (diff) {
      fetch(`${apiUrl}/programada/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(diff),
      })
        .then((res) => res.json())
        .then((data) => fetchNewTargets(data))
        .then(() => fetchCurrTotal()) // Refresh total
        .then(() => setDiff()) // Clear diff
        .catch((err) => console.log('[CLIENT] Error fetching data:', err));
    }
  }

  async function handleUpload() {
    // Reset states before uploading a new file
    setProgramada();
    setDiff();
    setNewTargets();
    setFilePath(await window.electronAPI.openFile());
  }

  function fetchCurrTotal() {
    const params = new URLSearchParams({
      startDate: localStorage.getItem('progStartDate'),
    }).toString();
    fetch(`${apiUrl}/programada/total?${params}`)
      .then((res) => res.json())
      .then((data) => setCurrTotal(data[0].Total)) // single-record object
      .catch((err) => console.log('[CLIENT] Error fetching data:', err));
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
      .catch((err) => console.log('[CLIENT] Error fetching data:', err));
  }

  return (
    <Box>
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
          onClick={handleInsertAll}
          disabled={localStorage.getItem('progStartDate') !== null}
        >
          Cargar todo
        </Button>
      )}

      {programada && !diff && !newTargets && (
        <Button onClick={handleCompare}>Comparar</Button>
      )}

      {diff &&
        !(
          diff.added.length === 0 &&
          diff.modified.length === 0 &&
          diff.deleted.length === 0
        ) && <Button onClick={handleProgramadaUpdate}>Cargar cambios</Button>}

      {programada && <Typography>Total: {programada.total}</Typography>}
      {programada && !diff && !newTargets && (
        <DataTable
          cols={['Artículo', 'Talle', 'A Producir']} //, 'Producido', 'Falta']}
        >
          {programada.rows.map((row, i) => (
            <tr key={i}>
              <td>{row.articulo}</td>
              <td>{row.talle}</td>
              <td>{row.aProducir}</td>
              {/* <td>{row.producido}</td>
              <td>{row.falta}</td> */}
            </tr>
          ))}
        </DataTable>
      )}

      {diff && (
        <Box>
          <Box>
            <Typography>Agregado</Typography>
            <DataTable
              cols={['Artículo', 'Talle', 'A Producir']} //, 'Producido', 'Falta']}
            >
              {diff.added.map((row, i) => (
                <tr key={i}>
                  <td>{row.articulo}</td>
                  <td>{row.talle}</td>
                  <td>{row.aProducir}</td>
                  {/* <td>{row.producido}</td>
            <td>{row.falta}</td> */}
                </tr>
              ))}
            </DataTable>
          </Box>

          <Box>
            <Typography>Modificado</Typography>
            <DataTable
              cols={['Articulo', 'Talle', 'A Producir']} //, 'Producido', 'Falta']}
            >
              {diff.modified.map((row, i) => (
                <tr key={i}>
                  <td>{row.articulo}</td>
                  <td>{row.talle}</td>
                  <td>{row.aProducir}</td>
                  {/* <td>{row.producido}</td>
            <td>{row.falta}</td> */}
                </tr>
              ))}
            </DataTable>

            <Typography>Eliminado</Typography>
            <DataTable
              cols={['Articulo', 'Talle', 'A Producir']} //, 'Producido', 'Falta']}
            >
              {diff.deleted.map((row, i) => (
                <tr key={i}>
                  <td>{row.articulo}</td>
                  <td>{row.talle}</td>
                  <td>{row.aProducir}</td>
                  {/* <td>{row.producido}</td>
            <td>{row.falta}</td> */}
                </tr>
              ))}
            </DataTable>
          </Box>
        </Box>
      )}

      {newTargets && (
        <Typography
          component='pre'
          sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
        >
          {JSON.stringify(newTargets, null, 2)}
        </Typography>
      )}
    </Box>
  );
}
