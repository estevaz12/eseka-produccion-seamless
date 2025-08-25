import { SparkLineChart } from '@mui/x-charts';
import CardOverflow from '@mui/joy/CardOverflow';
import Box from '@mui/joy/Box';

export default function SparkLineOverflow({ dataSettings }) {
  return (
    <Box className='relative w-full grow'>
      <CardOverflow className='absolute -bottom-4 left-0 right-0 p-0 [&_svg]:rounded-b-[var(--joy-radius-sm)] h-full'>
        <SparkLineChart
          {...dataSettings}
          area
          showTooltip
          showHighlight
          margin={0}
        />
      </CardOverflow>
    </Box>
  );
}
