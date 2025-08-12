import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalOverflow from '@mui/joy/ModalOverflow';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import ModalClose from '@mui/joy/ModalClose';
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
