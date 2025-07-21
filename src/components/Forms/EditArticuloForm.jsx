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
import { useConfig } from '../../ConfigContext.jsx';
import ColorDistrInputs from '../Inputs/ColorDistrInputs.jsx';
import { ErrorContext } from '../../Contexts.js';

// TODO: loading indicator
export default function EditArticuloForm({ articuloData }) {
  const { apiUrl } = useConfig();
  const [formData, setFormData] = useState(articuloData);
  const [error, setError] = useState(false); // 'color' || 'distr' || false

  async function handleSubmit(e) {
    e.preventDefault();

    // validate colorDistr
    if (formData.colorDistr.length > 1) {
      // can't be greater than 100%
      const distrSum = formData.colorDistr.reduce(
        (acc, curr) => acc + curr.porcentaje,
        0
      );

      if (distrSum > 1) {
        setError('distr');
        return;
      }

      // validate colors are unique
      const colors = formData.colorDistr.map((color) => color.color);
      if (new Set(colors).size !== colors.length) {
        setError('color');
        return;
      }
    }

    if (formData.tipo !== articuloData.tipo) {
      // edit articulo
      try {
        fetch(`${apiUrl}/articulo/updateTipo`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            articulo: formData.articulo,
            tipo: formData.tipo,
          }),
        });
      } catch (err) {
        console.error(`[CLIENT] Error fetching /articulo/updateTipo:`, err);
      }
    }

    if (
      JSON.stringify(formData.colorDistr) !==
      JSON.stringify(articuloData.colorDistr)
    ) {
      try {
        await fetch(`${apiUrl}/colorDistr/insert`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            articulo: formData.articulo,
            colorDistr: formData.colorDistr, // [{color, porcentaje}]
          }),
        });
      } catch (err) {
        console.error('[CLIENT] Error fetching /colorDistr/insert:', err);
      }
    }

    setError(false);
    window.location.reload();
  }

  return (
    <form
      key={articuloData.articulo}
      onSubmit={(e) => {
        handleSubmit(e, articuloData.articulo);
      }}
      className='w-sm'
    >
      <Stack direction='column' className='gap-4'>
        {/* articulo and tipo */}
        <Stack direction='row' className='gap-4'>
          <FormControl>
            <FormLabel>Artículo</FormLabel>
            <Input
              value={articuloData.articulo}
              disabled
              className='w-24 grow'
            />
          </FormControl>

          <FormControl className='grow'>
            <FormLabel>Tipo (si aplica)</FormLabel>
            <Stack direction='row' className='gap-2'>
              <Input
                value={formData.tipo ?? articuloData.tipo ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tipo: e.target.value,
                  })
                }
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
        <ErrorContext value={error}>
          <ColorDistrInputs formData={formData} setFormData={setFormData} />
        </ErrorContext>
        {/* submit btn */}
        <Button type='submit'>Guardar cambios</Button>
      </Stack>
    </form>
  );
}
