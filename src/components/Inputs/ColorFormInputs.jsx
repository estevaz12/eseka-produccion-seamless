import { useEffect, useState } from 'react';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Typography from '@mui/joy/Typography';
import ColorSelect from './ColorSelect.jsx';
import { useConfig } from '../../ConfigContext.jsx';

let apiUrl;

function ColorFormInputs({
  fieldName, // colorDistr or colorCodes
  title,
  label2,
  input2Key,
  input2Attrs,
  input2Val,
  formData,
  setFormData,
}) {
  apiUrl = useConfig().apiUrl;
  const [colors, setColors] = useState([]);
  const [colorInput, setColorInput] = useState();
  const [input2, setInput2] = useState(input2Val ? input2Val : undefined);
  const [key, setKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    fetch(`${apiUrl}/colors`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignore) setColors(data);
      })
      .catch((err) => console.error('[CLIENT] Error fetching /colors:', err));

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <Box>
      <Box key={key}>
        <Typography>{title}</Typography>

        <ColorSelect
          onChange={setColorInput}
          inheritedColors={colors}
          required={!(formData[fieldName]?.length >= 0)}
          allowAdd
        />

        <FormControl>
          <FormLabel>{label2}</FormLabel>
          <Input
            value={input2}
            onChange={(e) =>
              input2Key === 'code'
                ? setInput2(e.target.value.trim().toUpperCase())
                : setInput2(e.target.value)
            }
            slotProps={{ input: { ...input2Attrs } }}
          />
        </FormControl>
      </Box>
      <Button
        onClick={() => {
          if (colorInput && input2) {
            setFormData((prev) => ({
              ...prev,
              [fieldName]: [
                ...(prev[fieldName] || []),
                {
                  color: colorInput,
                  [input2Key]: input2,
                },
              ],
            }));
            setColorInput();
            setInput2();
            setKey((prev) => prev + 1);
          }
        }}
      >
        Agregar
      </Button>

      {formData[fieldName] &&
        formData[fieldName].map((color, i) => {
          const colorObj = colors.find((c) => c.Id === color.color);
          return (
            <Box key={i}>
              <Input value={colorObj ? colorObj.Color : color.color} disabled />
              <Input value={color[input2Key]} disabled />
            </Box>
          );
        })}
    </Box>
  );
}

export default ColorFormInputs;
