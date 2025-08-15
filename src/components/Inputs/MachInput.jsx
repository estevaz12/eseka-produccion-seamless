import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';

export default function MachInput({ formData, setFormData }) {
  return (
    <FormControl>
      <FormLabel>Máquina</FormLabel>
      <Input
        type='number'
        placeholder='...'
        className='w-20'
        slotProps={{
          input: { min: 1001, max: 1037 },
        }}
        onChange={(e) => setFormData({ ...formData, machine: e.target.value })}
      />
    </FormControl>
  );
}
