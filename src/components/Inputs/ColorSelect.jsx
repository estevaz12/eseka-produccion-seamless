import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Option from '@mui/joy/Option';
import { useEffect, useState } from 'react';
import { useConfig } from '../../ConfigContext.jsx';
import SelectClearable from './SelectClearable.jsx';
import AddColorBtn from './AddColorBtn.jsx';

let apiUrl;

export default function ColorSelect({
  onChange,
  inheritedColors,
  showLabel = true,
  allowAdd = false,
  required = false,
  className = '',
  val = null,
}) {
  apiUrl = useConfig().apiUrl;
  const [value, setValue] = useState(val);
  const [selectOpen, setSelectOpen] = useState(false);
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
    <FormControl className={`min-w-56 ${className}`} required={required}>
      {showLabel && <FormLabel>Color</FormLabel>}
      <SelectClearable
        value={value}
        setValue={setValue}
        setFormData={onChange}
        placeholder='Seleccione...'
        required={required}
        listboxOpen={selectOpen}
        onListboxOpen={setSelectOpen}
      >
        {colors
          .slice()
          .sort((a, b) => a.Color.localeCompare(b.Color))
          .map((color) => (
            <Option key={color.Id} value={color.Id} label={color.Color}>
              {color.Color}
            </Option>
          ))}

        {allowAdd && (
          <AddColorBtn
            setSelectVal={setValue}
            setSelectOpen={setSelectOpen}
            setFormData={onChange}
          />
        )}
      </SelectClearable>
    </FormControl>
  );
}
