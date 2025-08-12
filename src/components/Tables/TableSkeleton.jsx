import Skeleton from '@mui/joy/Skeleton';

export default function TableSkeleton({ numCols, numRows = 20 }) {
  return Array.from({ length: numRows }, (_, i) => (
    <tr key={i}>
      {Array.from({ length: numCols }, (_, j) => (
        <td key={j}>
          <Skeleton animation='wave' variant='text' level='body-md' />
        </td>
      ))}
    </tr>
  ));
}
