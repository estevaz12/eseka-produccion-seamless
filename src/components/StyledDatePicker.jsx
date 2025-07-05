import { styled } from '@mui/joy/styles';
import { DatePicker, PickersTextField } from '@mui/x-date-pickers';

const JoyPickersTextField = styled(PickersTextField)({
  boxShadow: 'var(--joy-shadowRing)',
  '& *': {
    transition: 'none !important',
    transform: 'none !important',
    fontFamily: 'var(--joy-fontFamily-body) !important',
  },
  '& label': {
    fontSize: 'var(--joy-fontSize-sm)',
    margin: '0 0 0.375rem 0',
    lineHeight: 'var(--joy-lineHeight-sm)',
    color: 'var(--joy-palette-text-primary)',
    position: 'relative',
  },
  '& span': {
    color: 'var(--joy-palette-text-secondary)',
    lineHeight: 'var(--joy-lineHeight-md)',
  },
  '& button': {
    color: 'var(--joy-palette-text-secondary)',
  },
  '& .MuiPickersInputBase-root': {
    minHeight: '2.25rem',
    paddingInline: '0.75rem',
    fontSize: 'var(--joy-fontSize-md)',
    backgroundColor: 'var(--joy-palette-background-surface)',
    border: '1px solid var(--joy-palette-neutral-outlinedBorder)',
    borderRadius: 'var(--joy-radius-sm)',
  },
  // '& .MuiPickersInputBase-root.Mui-focused': {
  //   borderColor: 'var(--joy-palette-focusVisible)',
  // },
  '& .MuiPickersOutlinedInput-notchedOutline': {
    display: 'none',
  },
  '& .MuiPickersSectionList-root': {
    padding: '0',
  },
});

export default function StyledDatePicker({ ...props }) {
  return (
    <DatePicker
      {...props}
      slots={{
        textField: JoyPickersTextField,
      }}
    />
  );
}
