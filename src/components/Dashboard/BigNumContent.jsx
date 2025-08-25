import Skeleton from '@mui/joy/Skeleton';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';

export default function BigNumContent({ loading, title, children, subtitle }) {
  return (
    <Stack direction='column' className='items-center h-full gap-2'>
      <Typography level='title-lg'>{title}</Typography>

      <Typography level='h2' className='grow'>
        <Skeleton loading={loading} className='rounded-[var(--joy-radius-sm)]'>
          {children}
        </Skeleton>
      </Typography>
      <Typography level='body-sm'>{subtitle}</Typography>
    </Stack>
  );
}
