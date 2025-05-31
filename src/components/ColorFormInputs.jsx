import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Typography,
} from '@mui/joy';

function ColorFormInputs({
  fieldName, // colorDistr or colorCodes
  title,
  label2,
  input2Key,
  input2Attrs,
  articuloFormData,
  setArticuloFormData,
}) {
  const [color, setColor] = useState();
  const [input2, setInput2] = useState();

  return (
    <Box>
      <Typography>{title}</Typography>
      <FormControl>
        <FormLabel>Color</FormLabel>
        <Input value={color} onChange={(e) => setColor(e.target.value)} />
      </FormControl>
      <FormControl>
        <FormLabel>{label2}</FormLabel>
        <Input
          value={input2}
          onChange={(e) => setInput2(e.target.value)}
          slotProps={{ input: { ...input2Attrs } }}
        />
      </FormControl>
      <Button
        onClick={() => {
          if (color && input2) {
            setArticuloFormData((prev) => ({
              ...prev,
              [fieldName]: [
                ...(prev[fieldName] || []),
                {
                  color: color,
                  [input2Key]: !input2 || input2 === '' ? null : input2,
                },
              ],
            }));
            setColor();
            setInput2();
          }
        }}
      >
        Agregar
      </Button>

      {articuloFormData[fieldName] &&
        articuloFormData[fieldName].map((color, i) => (
          <Box key={i}>
            <Input value={color.color} disabled />
            <Input value={color[input2Key]} disabled />
          </Box>
        ))}
    </Box>
  );
}

export default ColorFormInputs;
