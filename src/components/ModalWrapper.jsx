import {
  Modal,
  ModalDialog,
  ModalOverflow,
  DialogTitle,
  DialogContent,
} from '@mui/joy';

export default function ModalWrapper({
  title,
  content,
  children,
  contentClassName = '',
}) {
  return (
    <Modal open>
      <ModalOverflow>
        <ModalDialog>
          <DialogTitle>{title}</DialogTitle>
          <DialogContent className={contentClassName}>{content}</DialogContent>
          {children}
        </ModalDialog>
      </ModalOverflow>
    </Modal>
  );
}
