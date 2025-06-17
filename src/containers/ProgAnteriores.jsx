import { Box } from '@mui/joy';
import ProgramadaTable from '../components/ProgramadaTable.jsx';
import ProgSearchForm from '../components/ProgSearchForm.jsx';

export default function ProgAnteriores() {
  return (
    <Box>
      <ProgSearchForm />

      <ProgramadaTable />
    </Box>
  );
}
