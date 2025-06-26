import { useEffect, useState } from 'react';
// import ColorFormInputs from './ColorFormInputs.jsx';
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
              placeholder: 'Sin "."',
              onChange: (e) =>
                setFormData({
                  ...formData,
                  articulo:
                    newColorCode.StyleCode.articulo + '.' + e.target.value,
                }),
            }}
          />
          <FormHelperText>
            Si es un&nbsp;<Typography variant='solid'>PARCHE</Typography>
            &nbsp;ingresar punto "9".
          </FormHelperText>
        </FormControl>
      </Box>
      <FormControl>
        <FormLabel>Tipo (si aplica)</FormLabel>
        <Input
          value={newColorCode.StyleCode.tipo || ''}
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

      <Box>
        <FormControl>
          <FormLabel>Código</FormLabel>
          <Input value={newColorCode.StyleCode.color} type='text' disabled />
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
          required={!(formData.colorCodes?.length >= 0)}
        />
      </Box>

      <Button type='submit'>Agregar código</Button>
    </form>
  );
}
