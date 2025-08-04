import {
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Option,
  Stack,
} from '@mui/joy';
import ColorSelect from './ColorSelect.jsx';
import SelectClearable from './SelectClearable.jsx';
import { useState } from 'react';

export default function ArtColorTalleInputs({
  formData,
  setFormData,
  btnProps,
  inheritedColors,
  children,
}) {
  const [selectVal, setSelectVal] = useState(null);
  const [selectOpen, setSelectOpen] = useState(false);

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
        <SelectClearable
          value={selectVal}
          setValue={setSelectVal}
          listboxOpen={selectOpen}
          onListboxOpenChange={setSelectOpen}
          setFormData={(val) => setFormData({ ...formData, talle: val })}
          placeholder='0-7'
          className='min-w-20'
        >
          {['0', '1', '2', '3', '4', '5', '6', '7'].map((val) => (
            <Option key={val} value={val} label={val}>
              {val}
            </Option>
          ))}
        </SelectClearable>
      </FormControl>

      <ColorSelect
        onChange={(color) => setFormData({ ...formData, colorId: color })}
        inheritedColors={inheritedColors}
      />

      {children}

      <IconButton
        color={btnProps.color}
        variant={btnProps.variant}
        type={btnProps.type}
        onKeyDown={btnProps.onKeyDown}
        disabled={Object.values(formData).every(
          (val) => val === undefined || val === ''
        )}
      >
        {btnProps.icon}
      </IconButton>
    </Stack>
  );
}
