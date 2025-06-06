import { FormControl, FormLabel, Option, Select } from '@mui/joy';

export default function ColorSelect({ colors, onChange, required = false }) {
  return (
    <FormControl>
      <FormLabel>Color</FormLabel>
      <Select
        placeholder='Seleccione un color...'
        onChange={(event, value) => onChange(value)}
        required={required}
      >
        <Option value=''>Seleccione un color...</Option>
        {colors.map((color) => (
          <Option key={color.Id} value={color.Id}>
            {color.Color}
          </Option>
        ))}
      </Select>
    </FormControl>
  );
}
