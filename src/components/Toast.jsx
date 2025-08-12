import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import ErrorRounded from '@mui/icons-material/ErrorRounded';
import IconButton from '@mui/joy/IconButton';
import Snackbar from '@mui/joy/Snackbar';
import { useState } from 'react';

export default function Toast({ toast, setToasts }) {
  const [open, setOpen] = useState(true);
  const startDecorator =
    toast.type === 'success' ? <CheckCircleRounded /> : <ErrorRounded />;

  const removeToast = (id) => {
    setOpen(false);
    setToasts((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      localStorage.setItem('toasts', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <Snackbar
      color={toast.type}
      variant='soft'
      size='sm'
      autoHideDuration={5000}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      open={open}
      className='static ml-auto w-fit'
      onClose={(event, reason) => {
        if (reason === 'clickaway') {
          return;
        }

        removeToast(toast.id);
      }}
      startDecorator={startDecorator}
      endDecorator={
        <IconButton
          size='sm'
          variant='soft'
          color={toast.type}
          onClick={() => removeToast(toast.id)}
        >
          <CloseRounded />
        </IconButton>
      }
    >
      {toast.message}
    </Snackbar>
  );
}
