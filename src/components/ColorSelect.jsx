import { FormControl, FormLabel, Option, Select } from '@mui/joy';
import { useEffect, useState } from 'react';
import { useConfig } from '../ConfigContext.jsx';

let apiUrl;

export default function ColorSelect({
  onChange,
  inheritedColors,
  required = false,
}) {
  apiUrl = useConfig().apiUrl;
  const [colors, setColors] = useState(
    Array.isArray(inheritedColors) ? inheritedColors : []
  );

  useEffect(() => {
    let ignore = false;
    if (Array.isArray(inheritedColors)) {
      setColors(inheritedColors);
    } else {
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
  }, [inheritedColors]);

  return (
    <FormControl>
      <FormLabel>Color</FormLabel>
      <Select
        placeholder='Seleccione un color...'
        onChange={(event, value) => onChange(value)}
        required={required}
      >
        <Option value=''>Seleccione un color...</Option>
        {colors
          .slice()
          .sort((a, b) => a.Color.localeCompare(b.Color))
          .map((color) => (
            <Option key={color.Id} value={color.Id}>
              {color.Color}
            </Option>
          ))}
      </Select>
    </FormControl>
  );
}
