import { Box, Typography, Button } from '@mui/joy';
import InputFileUpload from '../components/InputFileUpload.jsx';
import { useEffect, useState } from 'react';
import { useConfig } from '../ConfigContext.jsx';
import DataTable from '../components/DataTable.jsx';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

export default function Programada() {
  const { apiUrl, sqlDateFormat } = useConfig();
  const [filePath, setFilePath] = useState();
  const [programada, setProgramada] = useState();
  const [diff, setDiff] = useState();

  useEffect(() => {
    if (filePath) {
      const params = new URLSearchParams({ path: filePath }).toString();
      fetch(`${apiUrl}/programada/file?${params}`)
        .then((res) => res.json())
        .then((data) => setProgramada(data))
        .catch((err) => console.log('[CLIENT] Error fetching data:', err));
    }
  }, [filePath]);

  function handleInsertAll() {
    if (programada) {
      fetch(`${apiUrl}/programada/insertAll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(programada),
      })
        // .then((res) =>
        //   console.log(`[CLIENT] Response:\n${JSON.stringify(res)}`)
        // )
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
          new: programada,
        }),
      })
        .then((res) => res.json())
        .then((data) => setDiff(data))
        .catch((err) => console.log('[CLIENT] Error fetching data:', err));
    }
  }

  async function handleUpload() {
    setFilePath(await window.electronAPI.openFile());
  }

  return (
    <Box>
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

      {programada && (
        <DataTable
          cols={['Artículo', 'Talle', 'A Producir']} //, 'Producido', 'Falta']}
        >
          {programada.map((row, i) => (
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

      {diff && JSON.stringify(diff, null, 2)}
    </Box>
  );
}
