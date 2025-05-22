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

  function fetchCurrTotal() {
    const params = new URLSearchParams({
      startDate: localStorage.getItem('progStartDate'),
    }).toString();
    fetch(`${apiUrl}/programada/total?${params}`)
      .then((res) => res.json())
      .then((data) => setCurrTotal(data[0].Total)) // single-record object
      .catch((err) => console.log('[CLIENT] Error fetching data:', err));
  }

  function handleInsertAll() {
    if (programada) {
      fetch(`${apiUrl}/programada/insertAll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(programada.rows),
      })
        // .then((res) =>
        //   console.log(`[CLIENT] Response:\n${JSON.stringify(res)}`)
        // )
        .catch((err) => console.log('[CLIENT] Error fetching data:', err));
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
        .then(fetchCurrTotal()) // Refresh total
        .catch((err) => console.log('[CLIENT] Error fetching data:', err));
    }
  }

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

  async function handleUpload() {
    setProgramada();
    setDiff();
    setFilePath(await window.electronAPI.openFile());
  }

  return (
    <Box>
      <Typography>
        Total Actual:{' '}
        {
          currTotal // if
            ? JSON.stringify(currTotal)
            : localStorage.getItem('progStartDate') // else if
            ? 'Cargando...'
            : 0 //else
        }
      </Typography>
      <InputFileUpload onClick={handleUpload} />
      <Typography>File path: {filePath}</Typography>

      <DatePicker
        label='Fecha de inicio'
        value={
          localStorage.getItem('progStartDate')
            ? dayjs(localStorage.getItem('progStartDate'))
            : undefined
        }
        onChange={(newValue) => {
          localStorage.setItem('progStartDate', newValue.format(sqlDateFormat));
        }}
        disableFuture
        disabled={localStorage.getItem('progStartDate') !== null}
      />

      {programada && (
        <Button
          onClick={handleInsertAll}
          disabled={localStorage.getItem('progStartDate') !== null}
        >
          Cargar todo
        </Button>
      )}

      {programada && <Button onClick={handleCompare}>Comparar</Button>}

      {diff &&
        !(
          diff.added.length === 0 &&
          diff.modified.length === 0 &&
          diff.deleted.length === 0
        ) && <Button onClick={handleProgramadaUpdate}>Cargar cambios</Button>}

      {programada && <Typography>Total: {programada.total}</Typography>}
      {programada && !diff && (
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
    </Box>
  );
}
