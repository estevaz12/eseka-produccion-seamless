import { useState } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  FormHelperText,
  Typography,
  Button,
} from '@mui/joy';
import ColorFormInputs from './ColorFormInputs.jsx';
import { useConfig } from '../ConfigContext.jsx';

export default function NewArticuloForm({
  newArticuloData,
  setNewArticuloData,
}) {
  const { apiUrl } = useConfig();
  const [formData, setFormData] = useState({});

  function handleSubmit(e, articulo, articuloExists) {
    // formData = {
    //  tipo,
    //  colorDistr: [{color, porcentaje}], -- won't be there if no need to insert
    //  colorCodes: [{color, code}]  -- won't be there if no need to insert
    // }
    e.preventDefault();
    const data = { articulo, ...formData };
    if (!articuloExists) {
      // if articulo doesn't exist, insert articulo, colorDistr, and colorCodes
      fetch(`${apiUrl}/articulo/insertWithColors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).catch((err) =>
        console.error(
          '[CLIENT] Error fetching /articulo/insertWithColors:',
          err
        )
      );
    } else {
      // if articulo exists, check if colorCodes and colorDistr exists
      // if not, insert them
      if (formData.colorDistr) {
        fetch(`${apiUrl}/colorDistr/insert`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            articulo: data.articulo,
            colorDistr: data.colorDistr, // [{color, porcentaje}]
          }),
        }).catch((err) =>
          console.error('[CLIENT] Error fetching /colorDistr/insert:', err)
        );
      }

      if (formData.colorCodes) {
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
      }
    }

    setNewArticuloData((prev) => prev.slice(1)); // Remove first item
    setFormData({});
  }

  return (
    <form
      key={newArticuloData.articulo}
      onSubmit={(e) => {
        handleSubmit(
          e,
          newArticuloData.articulo,
          newArticuloData.articuloExists
        );
      }}
    >
      <Box>
        <FormControl>
          <FormLabel>Articulo</FormLabel>
          <Input value={newArticuloData.articulo} disabled />
        </FormControl>

        <FormControl>
          <FormLabel>Tipo (si aplica)</FormLabel>
          <Input
            value={newArticuloData.tipo}
            onChange={(e) =>
              setFormData({
                ...formData,
                tipo: e.target.value,
              })
            }
            disabled={newArticuloData.tipo}
            maxLength={1}
            pattern='[%$#]'
          />
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
        </FormControl>

        {newArticuloData.colorDistr ? (
          <Typography>Distribución ya cargada</Typography>
        ) : (
          <ColorFormInputs
            fieldName='colorDistr'
            title='Distribución de colores'
            label2='Porcentaje'
            input2Key='porcentaje'
            input2Attrs={{ type: 'number', min: 0, max: 100 }}
            formData={formData}
            setFormData={setFormData}
          />
        )}

        {/* colorCodes will be inserted through newColorCodes.
        Leaving it in case its needed in the future. */}
        {/* {newArticuloData.colorCodes ? (
          <Typography>Códigos ya cargados</Typography>
        ) : (
          <ColorFormInputs
            fieldName='colorCodes'
            title='Códigos de colores'
            label2='Código'
            input2Key='code'
            input2Attrs={{
              type: 'text',
              required: !(formData.colorCodes?.length >= 0),
            }}
            formData={formData}
            setFormData={setFormData}
          />
        )} */}
      </Box>
      <Button type='submit'>Agregar artículo</Button>
    </form>
  );
}
