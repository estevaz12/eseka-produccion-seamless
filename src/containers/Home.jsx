import Box from '@mui/joy/Box';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { useEffect, useState } from 'react';
import { useConfig } from '../ConfigContext.jsx';
import ModalWrapper from '../components/ModalWrapper.jsx';
import NewColorCodeForm from '../components/Forms/NewColorCodeForm.jsx';
import { Outlet } from 'react-router';
import NavBar from '../components/NavBar.jsx';
import Toast from '../components/Toast.jsx';
import { ToastsContext } from '../Contexts.js';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from '../components/ErrorFallback.jsx';

let apiUrl;

export default function Home() {
  apiUrl = useConfig().apiUrl;

  const [newColorCodes, setNewColorCodes] = useState(() =>
    JSON.parse(localStorage.getItem('newColorCodes') || '[]')
  );

  // using localStorage so toasts persist through refresh
  const [toasts, setToasts] = useState(() =>
    JSON.parse(localStorage.getItem('toasts') || '[]')
  );

  function addColorCodes(newCodes) {
    const currCodes = JSON.parse(localStorage.getItem('newColorCodes') || '[]');
    // Make sure codes in localStorage are unique. Otherwise, the same
    // codes will be added every hour
    const uniqueNewCodes = newCodes.filter(
      (newCode) =>
        !currCodes.some(
          (curr) => curr.StyleCode.styleCode === newCode.StyleCode.styleCode
        )
    );

    const updatedCodes = [...currCodes, ...uniqueNewCodes];
    localStorage.setItem('newColorCodes', JSON.stringify(updatedCodes));
    setNewColorCodes(updatedCodes);
  }

  const addToast = (toast) => {
    const newToast = {
      ...toast,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    setToasts((prev) => {
      const updated = [...prev, newToast];
      localStorage.setItem('toasts', JSON.stringify(updated));
      return updated;
    });
  };

  // check for newColorCodes on load and then every half-hour
  useEffect(() => {
    let ignore = false;
    function fetchNewColorCodes() {
      fetch(`${apiUrl}/machines/newColorCodes`)
        .then((res) => res.json())
        .then((newCodes) => {
          if (!ignore) {
            // Whenever you update localStorage, also update state:
            addColorCodes(newCodes);
          }
        })
        .catch((err) =>
          console.error('[CLIENT] Error fetching /machines/newColorCodes:', err)
        );
    }

    // fetch and repeat every half-hour
    fetchNewColorCodes();

    const intervalId = setInterval(() => {
      fetchNewColorCodes();
    }, 0.5 * 3600 * 1000); // update every half-hour

    return () => {
      clearInterval(intervalId);
      ignore = true;
    };
  }, []);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ToastsContext value={{ addToast }}>
        <Stack
          direction='row'
          className='items-stretch justify-start size-full'
        >
          <aside className='fixed top-0 bottom-0 left-0 z-20 w-40 h-screen'>
            <NavBar />
          </aside>

          <Box className='w-full px-4 ml-40'>
            <Outlet context={{ addColorCodes }} />
          </Box>
        </Stack>

        {/* Modal for new Color Codes */}
        {newColorCodes.length > 0 && (
          <ModalWrapper
            title={
              <Typography>
                Agregar código de color&nbsp;&nbsp;
                <Typography variant='solid' color='primary'>
                  {newColorCodes[newColorCodes.length - 1].StyleCode.styleCode}
                </Typography>
              </Typography>
            }
            content={
              <Typography>
                Se encontró el código&nbsp;
                <Typography variant='soft'>
                  {newColorCodes[newColorCodes.length - 1].StyleCode.color}
                </Typography>
                &nbsp;para el art.&nbsp;
                <Typography variant='soft'>
                  {newColorCodes[newColorCodes.length - 1].StyleCode.articulo}
                  {newColorCodes[newColorCodes.length - 1].StyleCode.punto
                    ? `.${
                        newColorCodes[newColorCodes.length - 1].StyleCode.punto
                      }`
                    : ''}
                </Typography>
                &nbsp;talle&nbsp;
                <Typography variant='soft'>
                  {newColorCodes[newColorCodes.length - 1].StyleCode.talle}
                </Typography>
                &nbsp;en la máq.&nbsp;
                <Typography variant='soft'>
                  {newColorCodes[newColorCodes.length - 1].MachCode}
                </Typography>
                . Por favor, víncule el color correspondiente.
              </Typography>
            }
            contentClassName='w-xs'
          >
            <NewColorCodeForm
              newColorCode={newColorCodes[newColorCodes.length - 1]}
              setNewColorCodes={setNewColorCodes}
            />
          </ModalWrapper>
        )}

        {toasts.length > 0 && (
          <Stack
            direction='column'
            className='fixed bottom-2 right-2 z-[var(--joy-zIndex-snackbar)] gap-2'
          >
            {toasts.map((toast) => (
              <Toast key={toast.id} toast={toast} setToasts={setToasts} />
            ))}
          </Stack>
        )}
      </ToastsContext>
    </ErrorBoundary>
  );
}
