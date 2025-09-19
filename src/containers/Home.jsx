import Box from '@mui/joy/Box';
import Stack from '@mui/joy/Stack';
import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router';
import NavBar from '../components/NavBar.jsx';
import Toast from '../components/Toast.jsx';
import { ToastsContext } from '../Contexts.js';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from '../components/ErrorFallback.jsx';

export default function Home() {
  const navigate = useNavigate();
  // SEAMLESS, HOMBRE (ALG)
  const [room, setRoom] = useState(
    () => localStorage.getItem('lastRoom') || 'SEAMLESS'
  );

  // using localStorage so toasts persist through refresh
  const [toasts, setToasts] = useState(() =>
    JSON.parse(localStorage.getItem('toasts') || '[]')
  );

  const addToast = (toast) => {
    setToasts((prev) => {
      // If we're in ELECTRONICA and this is an electronico toast,
      // check for duplicates by machCode
      if (room === 'ELECTRONICA' && toast?.machCode !== null) {
        const exists = prev.some((t) => t.machCode === toast.machCode);
        if (exists) {
          return prev; // skip duplicate
        }
      }

      const newToast = {
        ...toast,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };

      const updated = [...prev, newToast];
      localStorage.setItem('toasts', JSON.stringify(updated));
      return updated;
    });
  };

  const removeToast = (id) => {
    setToasts((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      localStorage.setItem('toasts', JSON.stringify(updated));
      return updated;
    });
  };

  // reload on room change
  useEffect(() => {
    const lastRoom = localStorage.getItem('lastRoom');
    if (lastRoom !== room) {
      localStorage.setItem('lastRoom', room);
      if (room !== 'ELECTRONICA') window.location.reload();
    } else if (room === 'ELECTRONICA') {
      // lastRoom === room, meaning no change, initial render
      // whenever opening app in ELECTRONICA, redirect to maquinas
      navigate('/maquinas');
    }
  }, [room]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ToastsContext value={{ addToast, removeToast }}>
        <Stack
          direction='row'
          className='items-stretch justify-start size-full'
        >
          <aside className='fixed top-0 bottom-0 left-0 z-20 w-40 h-screen'>
            <NavBar room={room} setRoom={setRoom} />
          </aside>

          <Box className='w-full px-4 ml-40'>
            <Outlet
              context={{
                room,
                docena: room === 'SEAMLESS' ? 12 : 24,
                porcExtra: room === 'SEAMLESS' ? 1.01 : 1.02,
              }}
            />
          </Box>
        </Stack>

        {toasts.length > 0 && (
          <Stack
            direction='column'
            className='fixed bottom-2 right-2 z-[var(--joy-zIndex-snackbar)] gap-2'
          >
            {toasts.map((toast) => (
              <Toast key={toast.id} toast={toast} removeToast={removeToast} />
            ))}
          </Stack>
        )}
      </ToastsContext>
    </ErrorBoundary>
  );
}
