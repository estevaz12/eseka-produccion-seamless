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
    color: 'var(--joy-palette-text-icon)',
    fontSize: 'var(--joy-fontSize-xl2)',
    borderRadius: 'var(--joy-radius-sm)',
    padding: '4px',
    marginRight: '-8px',
    '&:hover': {
      backgroundColor: 'var(--joy-palette-primary-plainHoverBg)',
    },
  },
  '& .MuiPickersInputBase-root': {
    minHeight: '2.25rem',
    paddingInline: '0.75rem',
    fontSize: 'var(--joy-fontSize-md)',
    backgroundColor: 'var(--joy-palette-background-surface)',
    border: '1px solid var(--joy-palette-neutral-outlinedBorder)',
    borderRadius: 'var(--joy-radius-sm)',
    '&.Mui-focused::before': {
      boxSizing: 'border-box',
      content: '""',
      display: 'block',
      position: 'absolute',
      pointerEvents: 'none',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: 1,
      borderRadius: 'var(--joy-radius-sm)',
      margin: 'calc(1px * -1)',
      borderColor: 'var(--joy-palette-focusVisible)',
      boxShadow:
        'inset 0 0 0 calc(1 * var(--joy-focus-thickness)) var(--joy-palette-focusVisible)',
    },
  },
  '& .MuiPickersOutlinedInput-notchedOutline': {
    display: 'none',
  },
  '& .MuiPickersOutlinedInput-root.Mui-disabled *': {
    pointerEvents: 'none',
    cursor: 'default',
    color: 'var(--joy-palette-neutral-outlinedDisabledColor)',
    borderColor: 'var(--joy-palette-neutral-outlinedDisabledBorder)',
  },
  '& .MuiInputLabel-root': {
    '&.Mui-disabled, &.Mui-focused': {
      color: 'var(--joy-palette-text-primary)',
    },
  },
  '& .MuiPickersSectionList-root': {
    padding: '0',
    width: 'fit-content',
  },
  '& .MuiTouchRipple-root': {
    display: 'none',
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
