import { useState } from 'react';
import ColorFormInputs from './ColorFormInputs.jsx';
import { Box, Button, Typography } from '@mui/joy';
import { useConfig } from '../ConfigContext.jsx';
import FloatingLabelInput from './FloatingLabelInput.jsx';

export default function NewColorCodeForm({
  newColorCode,
  colors,
  setNewColorCodes,
}) {
  const apiUrl = useConfig().apiUrl;
  const [formData, setFormData] = useState({ colorCodes: [] });

  function handleSubmit(e) {
    // formData = {
    //  colorCodes: [{color, code}]
    // }
    e.preventDefault();

    const data = { ...formData };
    fetch(`${apiUrl}/colorCodes/insert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        articulo: data.articulo,
        colorCodes: data.colorCodes, // [{color, code}]
      }),
    }).catch((err) =>
      console.error('[CLIENT] Error fetching /colorCodes/insert:', err)
    );
    setNewColorCodes((prev) => prev.slice(1));
    setFormData({ colorCodes: [] });
  }

  return (
    <form key={newColorCode.MachCode} onSubmit={(e) => handleSubmit(e)}>
      {/* TODO: add input for punto and add to articulo (as string then convert to float) */}
      <Box>
        <Typography>
          {newColorCode.StyleCode.articulo}
          <Typography variant='solid'>.</Typography>
        </Typography>
        <FloatingLabelInput
          inputProps={{
            label: 'Punto',
            type: 'number',
            min: 0,
            max: 99,
            placeholder: 'Del 00 al 99...',
            onChange: (e) =>
              setFormData({
                ...formData,
                articulo:
                  newColorCode.StyleCode.articulo + '.' + e.target.value,
              }),
          }}
        />
      </Box>
      <ColorFormInputs
        fieldName='colorCodes'
        title='Códigos de colores'
        label2='Código'
        input2Key='code'
        input2Attrs={{
          type: 'text',
          required: formData.colorCodes.length < 0,
        }}
        input2Val={newColorCode.StyleCode.color}
        formData={formData}
        setFormData={setFormData}
        colors={colors}
      />
      <Button type='submit'>Agregar códigos</Button>
    </form>
  );
}
