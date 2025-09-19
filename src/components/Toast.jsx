import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import ErrorRounded from '@mui/icons-material/ErrorRounded';
import IconButton from '@mui/joy/IconButton';
import Snackbar from '@mui/joy/Snackbar';
import { useState } from 'react';

export default function Toast({ toast, removeToast }) {
  const [open, setOpen] = useState(true);
  const startDecorator =
    toast.type === 'success' ? <CheckCircleRounded /> : <ErrorRounded />;

  const closeToast = (id) => {
    setOpen(false);
    removeToast(id);
  };

  return (
    <Snackbar
      color={toast.type}
      variant='soft'
      size='sm'
      autoHideDuration={toast.duration !== undefined ? toast.duration : 5000}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      open={open}
      className='static ml-auto w-fit'
      onClose={(event, reason) => {
        if (reason === 'clickaway') {
          return;
        }

        closeToast(toast.id);
      }}
      startDecorator={startDecorator}
      endDecorator={
        <IconButton
          size='sm'
          variant='soft'
          color={toast.type}
          onClick={() => closeToast(toast.id)}
        >
          <CloseRounded />
        </IconButton>
      }
    >
      {toast.message}
    </Snackbar>
  );
}
