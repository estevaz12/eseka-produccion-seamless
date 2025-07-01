import { styled } from '@mui/joy/styles';
import { DatePicker, PickersTextField } from '@mui/x-date-pickers';

const JoyPickersTextField = styled(PickersTextField)({
  margin: '0.375rem 0 0 0',
  color: 'var(--joy-palette-text-secondary)',
  alignSelf: 'flex-start',
  display: 'flex',
  position: 'relative',
  flexDirection: 'column',
  '& *': {
    fontFamily: 'var(--joy-fontFamily-body) !important',
  },
  '& label': {
    // fontSize: 'var(--joy-fontSize-sm)',
    lineHeight: 'var(--joy-lineHeight-sm)',
    color: 'var(--joy-palette-text-secondary)',
  },
  '& span': {
    color: 'var(--joy-palette-text-secondary)',
  },
  '& button': {
    color: 'var(--joy-palette-text-secondary)',
  },
  '& .MuiPickersInputBase-root': {
    borderRadius: 'var(--joy-radius-sm)',
    minHeight: '2.25rem',
    paddingInline: '0.75rem',
    boxShadow: 'var(--joy-shadowRing)',
    lineHeight: 'var(--joy-lineHeight-md)',
  },
  // '& .MuiPickersInputBase-root.Mui-focused': {
  //   borderColor: 'var(--joy-palette-focusVisible)',
  // },
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
