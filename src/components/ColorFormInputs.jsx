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
  formData,
  setFormData,
  colors,
}) {
  const [color, setColor] = useState();
  const [input2, setInput2] = useState();
  const [key, setKey] = useState(0);

  return (
    <Box>
      <Box key={key}>
        <Typography>{title}</Typography>
        <FormControl>
          <FormLabel>Color</FormLabel>
          <Select
            placeholder='Seleccioná un color...'
            onChange={(event, value) => setColor(value)}
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
          if (color && input2) {
            setFormData((prev) => ({
              ...prev,
              [fieldName]: [
                ...(prev[fieldName] || []),
                {
                  color: color,
                  [input2Key]: input2,
                },
              ],
            }));
            setColor();
            setInput2();
            setKey((prev) => prev + 1);
          }
        }}
      >
        Agregar
      </Button>

      {formData[fieldName] &&
        formData[fieldName].map((color, i) => (
          <Box key={i}>
            <Input value={color.color} disabled />
            <Input value={color[input2Key]} disabled />
          </Box>
        ))}
    </Box>
  );
}

export default ColorFormInputs;
