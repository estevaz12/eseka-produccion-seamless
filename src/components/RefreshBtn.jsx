import { CloseRounded, RefreshRounded } from '@mui/icons-material';
import { IconButton } from '@mui/joy';

export default function RefreshBtn({
  handleRefresh,
  dangerousRefresh = false,
}) {
  return !dangerousRefresh ? (
    <IconButton color='primary' variant='soft' onClick={handleRefresh}>
      <RefreshRounded />
    </IconButton>
  ) : (
    <IconButton color='danger' variant='soft' onClick={handleRefresh}>
      <CloseRounded />
    </IconButton>
  );
}
