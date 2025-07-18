import { createContext, useState } from 'react';
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

export const ErrorContext = createContext(false);

export default function NewArticuloForm({
  newArticuloData,
  setNewArticuloData,
}) {
  const { apiUrl } = useConfig();
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(false); // 'color' || 'distr' || false

  function handleSubmit(e, articulo, articuloExists) {
    e.preventDefault();

    if (formData.colorDistr.length > 1) {
      const distrSum = formData.colorDistr.reduce(
        (acc, curr) => acc + curr.porcentaje,
        0
      );

      if (distrSum > 1) {
        // 100%
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

    const data = { articulo, ...formData };
    if (!articuloExists) {
      // if articulo doesn't exist, insert articulo, colorDistr
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
      // if articulo exists, check if colorDistr exists; if not, insert
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
    }

    setNewArticuloData((prev) => prev.slice(1)); // Remove first item
    setFormData({});
    setError(false);
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
        <ErrorContext value={error}>
          <ColorDistrInputs formData={formData} setFormData={setFormData} />
        </ErrorContext>
        {/* submit btn */}
        <Button type='submit'>Agregar artículo</Button>
      </Stack>
    </form>
  );
}
