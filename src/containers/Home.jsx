import {
  Table,
  Select,
  Option,
  FormControl,
  FormLabel,
  Box,
  Input,
  Button,
  Switch,
} from '@mui/joy';
import { renderTimeViewClock } from '@mui/x-date-pickers';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { useConfig } from '../ConfigContext.jsx';

export default function Home() {
  const { apiUrl } = useConfig();
  const [url, setUrl] = useState();
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({
    room: 'SEAMLESS',
    startDate: dayjs().startOf('month').add(6, 'hour').add(1, 'second'),
    endDate: dayjs(),
    actual: true,
    articulo: '',
  });

  useEffect(() => {
    if (!url) {
      const params = new URLSearchParams(formData).toString();

      fetch(`${apiUrl}/produccion?${params}`)
        .then((res) => res.json())
        .then((data) => setData(data))
        .catch((err) => console.log('[CLIENT] Error fetching data:', err));
    } else {
      fetch(url)
        .then((res) => res.json())
        .then((data) => setData(data))
        .catch((err) => console.log('[CLIENT] Error fetching data:', err));
    }
  }, [url]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // make sure endDate is the latest date
    const updatedFormData = {
      ...formData,
      endDate: formData.actual ? dayjs() : formData.endDate,
    };
    // update the view
    setFormData(updatedFormData);
    // can't reference state here since it still hasn't updated
    const params = new URLSearchParams(updatedFormData).toString();
    console.log(params);
    setUrl(`${apiUrl}/produccion?${params}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <Box>
      <Box>
        <form onSubmit={(e) => handleSubmit(e)}>
          <FormControl>
            <FormLabel>Room</FormLabel>
            <Select
              value={formData.room}
              onChange={(e, val) => setFormData({ ...formData, room: val })}
            >
              <Option value='SEAMLESS'>SEAMLESS</Option>
              <Option value='HOMBRE'>HOMBRE</Option>
              <Option value='MUJER'>MUJER</Option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Fecha de inicio</FormLabel>
            <DateTimePicker
              value={formData.startDate}
              onChange={(date) => {
                const hour = dayjs(date).hour();

                if (hour === 6 || hour === 14 || hour === 22) {
                  // add a second when hour is 6, 14, 22 to exclude data from
                  // previous turn
                  setFormData({
                    ...formData,
                    startDate: dayjs(date).set('minutes', 0).set('seconds', 1),
                  });
                } else {
                  setFormData({
                    ...formData,
                    startDate: dayjs(date).set('seconds', 0),
                  });
                }
              }}
              viewRenderers={{
                hours: renderTimeViewClock,
                minutes: null,
                seconds: null,
              }}
              disableFutur
              maxDateTime={formData.endDate}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Fecha final</FormLabel>
            <DateTimePicker
              value={formData.endDate}
              onChange={(date) => {
                const newEndDate = dayjs(date);

                if (
                  !formData.actual &&
                  !newEndDate.isBefore(formData.startDate)
                ) {
                  setFormData({
                    ...formData,
                    endDate: newEndDate.set('minutes', 0).set('seconds', 0),
                  });
                } else if (!formData.actual) {
                  setFormData({
                    ...formData,
                    endDate: formData.startDate,
                  });
                }
              }}
              viewRenderers={{
                hours: renderTimeViewClock,
                minutes: null,
                seconds: null,
              }}
              disabled={formData.actual}
              disableFuture
              minDateTime={formData.startDate}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Actual</FormLabel>
            <Switch
              checked={formData.actual}
              onChange={(e) => {
                const isChecked = e.target.checked;
                setFormData({
                  ...formData,
                  actual: isChecked,
                  endDate: isChecked ? dayjs() : formData.endDate,
                });
              }}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Artículo</FormLabel>
            <Input
              onChange={(e) =>
                setFormData({ ...formData, articulo: e.target.value })
              }
              placeholder='Buscar artículo...'
            />
          </FormControl>

          <Button type='submit' onKeyDown={(e) => handleKeyDown(e)}>
            Buscar
          </Button>
        </form>
      </Box>

      <Table aria-label='simple table' className='**:text-center'>
        <thead>
          <tr>
            <th>Artículo</th>
            <th>Unidades</th>
            <th>Docenas</th>
            <th>En Producción</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.StyleCode}>
              <td>{row.StyleCode}</td>
              <td>{row.Unidades}</td>
              <td>{(row.Unidades / 12).toFixed(1)}</td>
              <td>{row.Produciendo}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Box>
  );
}
