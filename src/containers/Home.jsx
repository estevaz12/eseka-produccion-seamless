import Box from '@mui/joy/Box';
import Stack from '@mui/joy/Stack';
import { useState } from 'react';
import { Outlet } from 'react-router';
import NavBar from '../components/NavBar.jsx';
import Toast from '../components/Toast.jsx';
import { ToastsContext } from '../Contexts.js';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from '../components/ErrorFallback.jsx';

export default function Home() {
  // using localStorage so toasts persist through refresh
  const [toasts, setToasts] = useState(() =>
    JSON.parse(localStorage.getItem('toasts') || '[]')
  );

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
            <Outlet />
          </Box>
        </Stack>

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
