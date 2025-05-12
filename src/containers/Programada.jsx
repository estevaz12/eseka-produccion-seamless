import { Box, Typography } from '@mui/joy';
import InputFileUpload from '../components/InputFileUpload.jsx';
import { useState } from 'react';

export default function Programada() {
  const [filePath, setFilePath] = useState();
  async function handleUpload() {
    setFilePath(await window.electronAPI.openFile());
  }

  return (
    <Box>
      <InputFileUpload onClick={handleUpload} />
      <Typography>File path: {filePath}</Typography>
    </Box>
  );
}
