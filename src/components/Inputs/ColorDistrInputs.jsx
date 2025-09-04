import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Stack from '@mui/joy/Stack';
import Switch from '@mui/joy/Switch';
import Typography from '@mui/joy/Typography';
import Input from '@mui/joy/Input';
import FormHelperText from '@mui/joy/FormHelperText';
import Checkbox from '@mui/joy/Checkbox';
import { useContext, useEffect, useState } from 'react';
import ColorSelect from './ColorSelect.jsx';
import { useConfig } from '../../ConfigContext.jsx';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import { ErrorContext } from '../../Contexts.js';
import { useOutletContext } from 'react-router';

let apiUrl;

export default function ColorDistrInputs({ formData, setFormData }) {
  apiUrl = useConfig().apiUrl;
  const { docena } = useOutletContext();
  const error = useContext(ErrorContext);
  const [colors, setColors] = useState([]);
  const [switched, setSwitched] = useState(
    formData?.colorDistr?.length > 1 ? true : false
  );
  const [numColors, setNumColors] = useState(
    formData?.colorDistr?.length > 1 ? formData.colorDistr.length : 2
  );

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
      <Typography level='title-md'>Distribución de Colores</Typography>

      <Stack direction='row' className='justify-between'>
        <Checkbox
          label='Todos los talles'
          checked={formData?.allTalles ?? true}
          disabled={formData.allTalles === undefined}
          onChange={(e) =>
            setFormData({ ...formData, allTalles: e.target.checked })
          }
        />

        <Switch
          checked={switched}
          onChange={(e) => {
            setSwitched(e.target.checked);
            setFormData({ ...formData, colorDistr: [] });
            setNumColors(2);
          }}
          endDecorator='Surtido'
        />
      </Stack>

      {switched && (
        <Stack direction='row' className='items-end justify-between'>
          <FormControl required>
            <FormLabel>Cant. Colores</FormLabel>
            <Input
              type='number'
              value={numColors}
              onChange={(e) => {
                setFormData({ ...formData, colorDistr: [] });
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

      {!switched ? (
        <ColorSelect
          val={formData.colorDistr?.[0]?.color || null}
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
          <Stack key={numColors} direction='column' className='gap-4'>
            {Array(numColors)
              .fill(0)
              .map((_, i) => (
                <Stack direction='row' key={i} className='items-end gap-4'>
                  <ColorSelect
                    val={formData.colorDistr?.[i]?.color || null}
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
                            ? Math.round(
                                formData.colorDistr[i].porcentaje * docena
                              )
                            : 0
                        }
                        onChange={(e) =>
                          setFormData((prev) => {
                            const colorDistr = [...(prev.colorDistr || [])];
                            colorDistr[i] = {
                              ...colorDistr[i],
                              porcentaje: Number(e.target.value) / docena,
                            };
                            return { ...prev, colorDistr };
                          })
                        }
                        slotProps={{ input: { min: 0, max: docena } }}
                        className='**:text-right w-15'
                      />
                    </FormControl>
                    <Typography>&nbsp;/&nbsp;{docena}</Typography>
                  </Stack>
                </Stack>
              ))}
          </Stack>

          {error && (
            <FormHelperText>
              <ErrorOutline />
              {error === 'distr'
                ? `La suma del surtido es mayor a ${docena} unidades.`
                : 'Los colores no se pueden repetir.'}
            </FormHelperText>
          )}
        </FormControl>
      )}
    </Stack>
  );
}
