import {
  Modal,
  ModalDialog,
  ModalOverflow,
  DialogTitle,
  DialogContent,
  ModalClose,
} from '@mui/joy';
import { useState } from 'react';

export default function ModalWrapper({
  title,
  content,
  children,
  handleClose,
  contentClassName = '',
}) {
  const [open, setOpen] = useState(true);

  return (
    <Modal open={open} onClose={handleClose || (() => setOpen(false))}>
      <ModalOverflow>
        <ModalDialog>
          <ModalClose />
          <DialogTitle>{title}</DialogTitle>
          <DialogContent className={contentClassName}>{content}</DialogContent>
          {children}
        </ModalDialog>
      </ModalOverflow>
    </Modal>
  );
}
