import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Option,
  Select,
  Typography,
} from '@mui/joy';

function ColorFormInputs({
  fieldName, // colorDistr or colorCodes
  title,
  label2,
  input2Key,
  input2Attrs,
  input2Val,
  formData,
  setFormData,
  colors,
}) {
  const [colorInput, setColorInput] = useState();
  const [input2, setInput2] = useState(input2Val ? input2Val : undefined);
  const [key, setKey] = useState(0);

  return (
    <Box>
      <Box key={key}>
        <Typography>{title}</Typography>
        <FormControl>
          <FormLabel>Color</FormLabel>
          <Select
            placeholder='Seleccione un color...'
            onChange={(event, value) => setColorInput(value)}
            required={!(formData[fieldName]?.length >= 0)}
          >
            {colors.map((color) => (
              <Option key={color.Id} value={color.Id}>
                {color.Color}
              </Option>
            ))}
          </Select>
        </FormControl>
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
