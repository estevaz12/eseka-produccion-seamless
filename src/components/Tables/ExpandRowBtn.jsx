import { KeyboardArrowDownRounded } from '@mui/icons-material';
import { useState } from 'react';

export default function ExpandRowBtn({ handleClick, ...props }) {
  const [open, setOpen] = useState(false);

  return (
    <KeyboardArrowDownRounded
      onClick={() => {
        handleClick();
        setOpen(!open);
      }}
      sx={{
        transition: 'transform 0.2s',
        // Rotate icon depending on sort order
        transform: open ? 'rotate(-180deg)' : 'rotate(0deg)',
      }}
      className={`invisible group-hover/row:visible ${props.className}`}
    />
  );
}
