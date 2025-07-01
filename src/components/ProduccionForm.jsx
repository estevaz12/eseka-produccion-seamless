import { Select, Option, FormControl, FormLabel, Box, Switch } from '@mui/joy';
import { renderTimeViewClock } from '@mui/x-date-pickers';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import { useConfig } from '../ConfigContext.jsx';
import ArtTalleColorInputs from './ArtTalleColorInputs.jsx';

let apiUrl, sqlDateFormat;

export default function ProduccionForm({ formData, setFormData, setUrl }) {
  [apiUrl, sqlDateFormat] = [useConfig().apiUrl, useConfig().sqlDateFormat];
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
    const params = new URLSearchParams({
      ...updatedFormData,
      startDate: updatedFormData.startDate.format(sqlDateFormat),
      endDate: updatedFormData.endDate.format(sqlDateFormat),
    }).toString();

    setUrl(`${apiUrl}/produccion?${params}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
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
            disableFuture
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

        <ArtTalleColorInputs
          formData={formData}
          setFormData={setFormData}
          btnType='submit'
          btnText='Buscar'
          onKeyDown={(e) => handleKeyDown(e)}
        />
      </form>
    </Box>
  );
}
