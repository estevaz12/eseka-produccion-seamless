import {
  FormControl,
  FormLabel,
  Stack,
  Switch,
  Typography,
  Input,
  FormHelperText,
} from '@mui/joy';
import { useContext, useEffect, useState } from 'react';
import ColorSelect from './ColorSelect.jsx';
import { useConfig } from '../ConfigContext.jsx';
import { ErrorOutline } from '@mui/icons-material';
import { ErrorContext } from './NewArticuloForm.jsx';

let apiUrl;

export default function ColorDistrInputs({ formData, setFormData }) {
  apiUrl = useConfig().apiUrl;
  const error = useContext(ErrorContext);
  const [colors, setColors] = useState([]);
  const [checked, setChecked] = useState(false);
  const [numColors, setNumColors] = useState(2);

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

  return (
    <Stack direction='column' className='gap-4'>
      <Stack direction='row' className='justify-between'>
        <Typography level='title-md'>Distribución de Colores</Typography>
        <Switch
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          endDecorator='Surtido'
        />
      </Stack>

      {checked && (
        <Stack direction='row' className='items-end justify-between'>
          <FormControl required>
            <FormLabel>Cant. Colores</FormLabel>
            <Input
              type='number'
              value={numColors}
              onChange={(e) => {
                if (e.target.value >= 2 && e.target.value <= colors.length)
                  setNumColors(Number(e.target.value));
              }}
              slotProps={{ input: { min: 2, max: colors.length } }}
              className='w-15'
            />
          </FormControl>
          <Typography level='body-sm text-right max-w-[200px]'>
            Si no tiene distribución, ponga{' '}
            <Typography variant='soft' color='warning' className='mx-0'>
              0
            </Typography>{' '}
            en cada color.
          </Typography>
        </Stack>
      )}

      {!checked ? (
        <ColorSelect
          onChange={(val) =>
            setFormData({
              ...formData,
              colorDistr: [{ color: val, porcentaje: 1 }],
            })
          }
          inheritedColors={colors}
          required
          allowAdd
        />
      ) : (
        <FormControl error={error} required>
          <Stack direction='row' className='items-center justify-between'>
            <FormLabel color={error === 'color' ? 'danger' : ''}>
              Colores
            </FormLabel>
            <FormLabel color={error === 'distr' ? 'danger' : ''}>
              Distribución
            </FormLabel>
          </Stack>
          <Stack direction='column' className='gap-4'>
            {Array(numColors)
              .fill(0)
              .map((_, i) => (
                <Stack direction='row' key={i} className='items-end gap-4'>
                  <ColorSelect
                    onChange={(val) =>
                      setFormData((prev) => {
                        const colorDistr = [...(prev.colorDistr || [])];
                        colorDistr[i] = {
                          ...colorDistr[i],
                          color: val,
                        };
                        return { ...prev, colorDistr };
                      })
                    }
                    inheritedColors={colors}
                    showLabel={false}
                    required
                    allowAdd
                    className='grow'
                  />

                  <Stack direction='row' className='items-center'>
                    <FormControl required error={error === 'distr'}>
                      <Input
                        type='number'
                        value={
                          formData.colorDistr?.[i]?.porcentaje
                            ? Math.round(formData.colorDistr[i].porcentaje * 12)
                            : 0
                        }
                        onChange={(e) =>
                          setFormData((prev) => {
                            const colorDistr = [...(prev.colorDistr || [])];
                            colorDistr[i] = {
                              ...colorDistr[i],
                              porcentaje: Number(e.target.value) / 12,
                            };
                            return { ...prev, colorDistr };
                          })
                        }
                        slotProps={{ input: { min: 0, max: 12 } }}
                        className='**:text-right w-15'
                      />
                    </FormControl>
                    <Typography>&nbsp;/&nbsp;12</Typography>
                  </Stack>
                </Stack>
              ))}
          </Stack>

          {error && (
            <FormHelperText>
              <ErrorOutline />
              {error === 'distr'
                ? 'La suma del surtido es mayor a 12 unidades.'
                : 'Los colores no se pueden repetir.'}
            </FormHelperText>
          )}
        </FormControl>
      )}
    </Stack>
  );
}
