import { useState } from 'react';
import ColorFormInputs from './ColorFormInputs.jsx';
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Typography,
} from '@mui/joy';
import { useConfig } from '../ConfigContext.jsx';
import FloatingLabelInput from './FloatingLabelInput.jsx';

export default function NewColorCodeForm({ newColorCode, setNewColorCodes }) {
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
      <Box>
        <Typography>
          {newColorCode.StyleCode.articulo}
          <Typography variant='solid'>.</Typography>
        </Typography>
        <FormControl>
          <FloatingLabelInput
            inputProps={{
              label: 'Punto',
              type: 'number',
              min: 0,
              max: 99,
              placeholder: 'Sin (.)',
              onChange: (e) =>
                setFormData({
                  ...formData,
                  articulo:
                    newColorCode.StyleCode.articulo + '.' + e.target.value,
                }),
            }}
          />
          <FormHelperText>
            Si es un <Typography variant='solid'>PARCHE</Typography> sin talle,
            dejar vacío. Si tiene talle, ingresar (.)9.
          </FormHelperText>
        </FormControl>
      </Box>
      <FormControl>
        <FormLabel>Tipo (si aplica)</FormLabel>
        <Input
          value={newColorCode.StyleCode.tipo}
          onChange={(e) =>
            setFormData({
              ...formData,
              tipo: e.target.value,
            })
          }
          disabled={newColorCode.StyleCode.tipo}
          maxLength={1}
          pattern='[%$#]'
        />
        {!newColorCode.StyleCode.tipo && (
          <FormHelperText>
            <Typography variant='solid' color='primary'>
              #
            </Typography>
            &nbsp;si se divide a la mitad.&nbsp;
            <Typography variant='solid' color='primary'>
              $
            </Typography>
            &nbsp;o&nbsp;
            <Typography variant='solid' color='primary'>
              %
            </Typography>
            &nbsp;si se duplica.
          </FormHelperText>
        )}
      </FormControl>

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
      />
      <Button type='submit'>Agregar códigos</Button>
    </form>
  );
}
