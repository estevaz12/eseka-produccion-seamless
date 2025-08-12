import CloseRounded from '@mui/icons-material/CloseRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import IconButton from '@mui/joy/IconButton';

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
