import { useState } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  FormHelperText,
  Typography,
  Button,
  Stack,
} from '@mui/joy';
import ColorFormInputs from './ColorFormInputs.jsx';
import { useConfig } from '../ConfigContext.jsx';
import ColorDistrInputs from './ColorDistrInputs.jsx';

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
      className='w-sm'
    >
      <Stack direction='column' className='gap-4'>
        {/* articulo and tipo */}
        <Stack direction='row' className='gap-4'>
          <FormControl>
            <FormLabel>Artículo</FormLabel>
            <Input
              value={newArticuloData.articulo}
              disabled
              className='w-24 grow'
            />
          </FormControl>

          <FormControl className='grow'>
            <FormLabel>Tipo (si aplica)</FormLabel>
            <Stack direction='row' className='gap-2'>
              <Input
                value={formData.tipo ?? newArticuloData.tipo ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tipo: e.target.value,
                  })
                }
                disabled={newArticuloData.tipo}
                type='text'
                slotProps={{ input: { maxLength: 1, pattern: '[#$%]' } }}
                className='w-10'
              />
              <FormHelperText className='mt-0'>
                <Stack direction='column' className='justify-between size-full'>
                  <Box>
                    <Typography level='body-sm'>
                      <Typography variant='soft' color='warning'>
                        #
                      </Typography>
                      &nbsp;si se divide a la mitad.&nbsp;
                    </Typography>
                  </Box>
                  <Box>
                    <Typography level='body-sm'>
                      <Typography variant='soft' color='warning'>
                        $
                      </Typography>
                      &nbsp;o&nbsp;
                      <Typography variant='soft' color='warning'>
                        %
                      </Typography>
                      &nbsp;si se duplica.
                    </Typography>
                  </Box>
                </Stack>
              </FormHelperText>
            </Stack>
          </FormControl>
        </Stack>
        {/* color distr */}
        <ColorDistrInputs formData={formData} setFormData={setFormData} />

        {/* <ColorFormInputs
          fieldName='colorDistr'
          title='Distribución de colores'
          label2='Porcentaje'
          input2Key='porcentaje'
          input2Attrs={{ type: 'number', min: 0, max: 100 }}
          formData={formData}
          setFormData={setFormData}
        /> */}

        {/* colorCodes will be inserted through newColorCodes.
        Leaving it in case it's needed in the future. */}
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

        <Button type='submit'>Agregar artículo</Button>
      </Stack>
    </form>
  );
}
