import { FormControl, FormLabel, Option, Select } from '@mui/joy';
import { useEffect, useState } from 'react';
import { useConfig } from '../ConfigContext.jsx';

let apiUrl;

export default function ColorSelect({
  onChange,
  inheretedColors = [],
  required = false,
}) {
  apiUrl = useConfig().apiUrl;
  const [colors, setColors] = useState(inheretedColors);

  useEffect(() => {
    let ignore = false;
    // prevents fetching when parent passes them already
    if (inheretedColors.length === 0) {
      fetch(`${apiUrl}/colors`)
        .then((res) => res.json())
        .then((data) => {
          if (!ignore) setColors(data);
        })
        .catch((err) => console.error('[CLIENT] Error fetching /colors:', err));
    }

    return () => {
      ignore = true;
    };
  }, [inheretedColors.length]);

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
