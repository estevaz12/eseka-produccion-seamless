import { Box, Typography, Button } from '@mui/joy';
import InputFileUpload from '../components/InputFileUpload.jsx';
import { useEffect, useState } from 'react';
import { useConfig } from '../ConfigContext.jsx';
import DataTable from '../components/DataTable.jsx';

export default function Programada() {
  const { apiUrl } = useConfig();
  const [filePath, setFilePath] = useState();
  const [data, setData] = useState();

  useEffect(() => {
    if (filePath) {
      const params = new URLSearchParams({ path: filePath }).toString();
      fetch(`${apiUrl}/programada/file?${params}`)
        .then((res) => res.json())
        .then((data) => setData(data))
        .catch((err) => console.log('[CLIENT] Error fetching data:', err));
    }
  }, [filePath]);

  function handleInsertAll() {
    if (data) {
      fetch(`${apiUrl}/programada/insertAll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
        .then((res) =>
          console.log(`[CLIENT] Response:\n${JSON.stringify(res)}`)
        )
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
      {data && <Button onClick={handleInsertAll}>Cargar todo</Button>}
      <DataTable
        cols={['Artículo', 'Talle', 'A Producir']} //, 'Producido', 'Falta']}
      >
        {data &&
          data.map((row, i) => (
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
  );
}
