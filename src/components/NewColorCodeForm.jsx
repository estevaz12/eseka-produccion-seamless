import { useEffect, useState } from 'react';
// import ColorFormInputs from './ColorFormInputs.jsx';
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Stack,
  Typography,
} from '@mui/joy';
import { useConfig } from '../ConfigContext.jsx';
import FloatingLabelInput from './FloatingLabelInput.jsx';
import ColorSelect from './ColorSelect.jsx';

let apiUrl;

export default function NewColorCodeForm({ newColorCode, setNewColorCodes }) {
  apiUrl = useConfig().apiUrl;
  const [colors, setColors] = useState([]);
  const [formData, setFormData] = useState({ colorCodes: [] });

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

  function handleSubmit(e) {
    e.preventDefault();

    // formData = {
    //  colorCodes: [{color, code}]
    // }
    const data = {
      ...formData,
      articulo: !formData.articulo
        ? newColorCode.StyleCode.articulo
        : formData.articulo,
      talle: newColorCode.StyleCode.talle,
      styleCode: newColorCode.StyleCode.styleCode,
    };

    fetch(`${apiUrl}/colorCodes/insert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        articulo: data.articulo,
        colorCodes: data.colorCodes, // [{color, code}]
        talle: data.talle,
        styleCode: data.styleCode,
      }),
    }).catch((err) =>
      console.error('[CLIENT] Error fetching /colorCodes/insert:', err)
    );
    const codes = JSON.parse(localStorage.getItem('newColorCodes'));
    codes.pop();
    localStorage.setItem('newColorCodes', JSON.stringify(codes));
    setNewColorCodes(codes);
    setFormData({ colorCodes: [] });

    if (codes.length === 0) {
      window.location.reload();
    }
  }

  return (
    <form
      key={newColorCode.MachCode}
      onSubmit={(e) => handleSubmit(e)}
      className='w-xs'
    >
      <Stack direction='column' className='gap-4'>
        {newColorCode.StyleCode.articulo % 1 === 0 && (
          <Stack direction='column' className='gap-1.5'>
            <Stack direction='row' className='items-start gap-4'>
              <FormControl>
                <FloatingLabelInput
                  inputProps={{
                    label: 'Artículo',
                    value: newColorCode.StyleCode.articulo,
                    type: 'number',
                  }}
                  className='w-24'
                  disabled
                />
              </FormControl>
              <Typography
                level='h1'
                color='primary'
                variant='outlined'
                className='rounded-md h-14'
              >
                .
              </Typography>
              <FormControl className='grow'>
                <FloatingLabelInput
                  inputProps={{
                    label: 'Punto (si aplica)',
                    type: 'number',
                    min: 0,
                    max: 99,
                    placeholder: 'Sin "."',
                    onChange: (e) =>
                      setFormData({
                        ...formData,
                        articulo:
                          newColorCode.StyleCode.articulo +
                          '.' +
                          e.target.value,
                      }),
                  }}
                />
              </FormControl>
            </Stack>
            <FormHelperText>
              <Typography
                variant='soft'
                level='body-sm'
                color='warning'
                className='mx-0'
              >
                PARCHES:
              </Typography>
              &nbsp;ingresar punto "9".
            </FormHelperText>
          </Stack>
        )}
        <FormControl>
          <FormLabel>Tipo (si aplica)</FormLabel>
          <Stack direction='row' className='gap-2'>
            <Input
              value={formData.tipo ?? newColorCode.StyleCode.tipo ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tipo: e.target.value,
                })
              }
              disabled={newColorCode.StyleCode.tipo}
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

        {/* <ColorFormInputs
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
      /> */}

        <Stack direction='row' className='gap-2'>
          <FormControl>
            <FormLabel>Código</FormLabel>
            <Input
              value={newColorCode.StyleCode.color}
              type='text'
              disabled
              className='*:text-center w-14'
            />
          </FormControl>

          <ColorSelect
            onChange={(color) => {
              setFormData((prev) => ({
                ...prev,
                colorCodes: [
                  { color: color, code: newColorCode.StyleCode.color },
                ],
              }));
            }}
            inheritedColors={colors}
            required
            allowAdd
            className='grow'
          />
        </Stack>

        <Button type='submit'>Agregar código</Button>
      </Stack>
    </form>
  );
}
