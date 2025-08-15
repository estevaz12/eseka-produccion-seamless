import { useEffect, useState } from 'react';
import FilterAltOffRounded from '@mui/icons-material/FilterAltOffRounded';
import MachInput from '../Inputs/MachInput.jsx';
import Stack from '@mui/joy/Stack';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import IconButton from '@mui/joy/IconButton';

export default function MachSearchForm({ machines, setFilteredMachines }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    setFilteredMachines(
      // if fileds are empty, it shows all rows
      machines.filter((row) => {
        // if the fields are undefined, they are set as empty strings
        const { machine = '', styleCode = '' } = formData;
        if (machine !== '') return row.MachCode === Number(machine);
        if (styleCode !== '') return row.StyleCode.startsWith(styleCode);

        return true;
      })
    );
  }, [formData, machines, setFilteredMachines]);
  // having machines in the dep array ensures live data

  return (
    <form
      onReset={() => {
        setFormData({});
      }}
    >
      <Stack direction='row' className='items-end gap-4'>
        <FormControl>
          <FormLabel>Cadena</FormLabel>
          <Input
            type='text'
            placeholder='Buscar...'
            className='w-32'
            onChange={(e) =>
              setFormData({ ...formData, styleCode: e.target.value })
            }
          />
        </FormControl>

        <MachInput formData={formData} setFormData={setFormData} />

        <IconButton
          color='danger'
          variant='soft'
          type='reset'
          disabled={Object.values(formData).every(
            (val) => val === undefined || val === ''
          )}
        >
          <FilterAltOffRounded />
        </IconButton>
      </Stack>
    </form>
  );
}
