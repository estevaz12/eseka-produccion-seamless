import { useEffect, useState } from 'react';
import { useConfig } from '../../ConfigContext.tsx';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import InputFileUpload from '../Inputs/InputFileUpload.jsx';

export default function FileUploadToolbar({
  setProgramada,
  setDiff,
  setNewTargets,
  diffMounted,
}) {
  const { apiUrl } = useConfig();
  const [filePath, setFilePath] = useState();

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

  return (
    <Stack direction='row' className='gap-2'>
      <Typography
        variant='outlined'
        color='neutral'
        noWrap
        className={`rounded-[var(--joy-radius-sm)] w-40 py-1.5 px-4 mx-0 ${
          !filePath && 'text-[var(--joy-palette-neutral-400)]'
        }`}
      >
        {filePath
          ? filePath.slice(
              Math.max(filePath.lastIndexOf('/'), filePath.lastIndexOf('\\'))
            )
          : 'Programada.pdf'}
      </Typography>
      <InputFileUpload onClick={handleUpload} />
    </Stack>
  );
}
