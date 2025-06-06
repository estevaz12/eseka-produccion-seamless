import CloseRounded from '@mui/icons-material';
import { FormControl, Select, IconButton, FormLabel, Option } from '@mui/joy';
import { useRef } from 'react';

export default function SelectClearable({
  data,
  dataVal,
  dataLabel,
  label,
  value,
  setValue,
  ...props
}) {
  const action = useRef(null);
  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <Select
        {...props}
        action={action}
        value={value}
        {...(value && {
          // display the button and remove select indicator
          // when user has selected a value
          endDecorator: (
            <IconButton
              size='sm'
              variant='plain'
              color='neutral'
              onMouseDown={(event) => {
                // don't open the popup when clicking on this button
                event.stopPropagation();
              }}
              onClick={() => {
                setValue('');
                action.current?.focusVisible();
              }}
            >
              <CloseRounded />
            </IconButton>
          ),
          indicator: null,
        })}
      >
        {data.map((item, i) => (
          <Option key={i} value={item[dataVal]}>
            {item[dataLabel]}
          </Option>
        ))}
      </Select>
    </FormControl>
  );
}
