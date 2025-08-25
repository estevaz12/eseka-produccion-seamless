import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';

export default function ChartHeader({ title, value, interval }) {
  return (
    <Stack direction='column' className='gap-1'>
      <Typography level='title-sm'>{title}</Typography>

      <Stack>
        <Typography level='h3'>{value}</Typography>

        <Typography level='body-xs'>{interval}</Typography>
      </Stack>
    </Stack>
  );
}
