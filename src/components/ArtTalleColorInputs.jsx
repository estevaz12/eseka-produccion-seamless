import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Option,
  Select,
  Stack,
} from '@mui/joy';
import ColorSelect from './ColorSelect.jsx';

export default function ArtColorTalleInputs({
  formData,
  setFormData,
  btnType,
  btnText,
  btnOnKeyDown,
  ...props
}) {
  return (
    <Stack direction='row' className='items-end gap-4'>
      <FormControl>
        <FormLabel>Artículo</FormLabel>
        <Input
          slotProps={{
            input: { type: 'number', min: 0.0, max: 99999.99, step: 0.01 },
          }}
          onChange={(e) =>
            setFormData({ ...formData, articulo: e.target.value })
          }
          placeholder='Buscar...'
          className='w-32'
        />
      </FormControl>

      <FormControl>
        <FormLabel>Talle</FormLabel>
        <Select
          placeholder='0-7'
          onChange={(e, val) => setFormData({ ...formData, talle: val })}
          className='min-w-20'
        >
          <Option value=''>0-7</Option>
          <Option value='0'>0</Option>
          <Option value='1'>1</Option>
          <Option value='2'>2</Option>
          <Option value='3'>3</Option>
          <Option value='4'>4</Option>
          <Option value='5'>5</Option>
          <Option value='6'>6</Option>
          <Option value='7'>7</Option>
        </Select>
      </FormControl>

      <ColorSelect
        onChange={(color) => setFormData({ ...formData, colorId: color })}
        {...props}
      />
      <Button type={btnType} onKeyDown={btnOnKeyDown}>
        {btnText}
      </Button>
    </Stack>
  );
}
