import ErrorRounded from '@mui/icons-material/ErrorRounded';
import SvgIcon from '@mui/joy/SvgIcon';
import Button from '@mui/joy/Button';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { Link } from 'react-router';

export default function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <Stack direction='column' className='justify-center w-screen h-screen'>
      <Stack direction='column' className='items-center gap-4'>
        <SvgIcon color='danger' fontSize='xl4'>
          <ErrorRounded />
        </SvgIcon>
        <Typography level='h1'>Hubo un error</Typography>
        <Typography>
          Por favor, informe al sector de Nautilus y vuelva a intentar.
        </Typography>
        {/* <Button>
      </Button> */}
        <Link to='/'>
          <Button onClick={resetErrorBoundary}>Volver</Button>
        </Link>
      </Stack>
    </Stack>
  );
}
