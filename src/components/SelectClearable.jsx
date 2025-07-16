import Select from '@mui/joy/Select';
import IconButton from '@mui/joy/IconButton';
import CloseRounded from '@mui/icons-material/CloseRounded';
import { useRef } from 'react';

export default function SelectClearable({
  value,
  setValue,
  setFormData,
  listboxOpen,
  onListboxOpen,
  children,
  ...props
}) {
  const action = useRef(null);

  return (
    <Select
      action={action}
      value={value}
      onChange={(e, newValue) => {
        console.log('select changed:', newValue);
        setValue(newValue);
        setFormData(newValue);
      }}
      listboxOpen={listboxOpen}
      onListboxOpenChange={onListboxOpen}
      {...props}
      {...(value && {
        // display the button and remove select indicator
        // when user has selected a value
        endDecorator: (
          <IconButton
            variant='plain'
            color='neutral'
            onMouseDown={(event) => {
              // don't open the popup when clicking on this button
              event.stopPropagation();
            }}
            onClick={() => {
              setValue(null);
              setFormData(''); // can't be null for requests
              action.current?.focusVisible();
            }}
          >
            <CloseRounded />
          </IconButton>
        ),
        indicator: null,
      })}
    >
      {children}
    </Select>
  );
}
