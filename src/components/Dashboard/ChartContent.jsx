import Skeleton from '@mui/joy/Skeleton';
import Stack from '@mui/joy/Stack';

export default function ChartContent({
  loading,
  direction = 'column',
  gap = 2,
  children,
}) {
  const gapClass = `gap-${gap}`;

  return (
    <Skeleton
      loading={loading}
      variant='rectangle'
      className='rounded-[var(--joy-radius-sm)] size-full'
    >
      <Stack direction={direction} className={`size-full ${gapClass}`}>
        {children}
      </Stack>
    </Skeleton>
  );
}
