import {
  Modal,
  ModalDialog,
  ModalOverflow,
  DialogTitle,
  DialogContent,
} from '@mui/joy';

export default function ModalWrapper({ title, content, children }) {
  return (
    <Modal open>
      <ModalOverflow>
        <ModalDialog>
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>{content}</DialogContent>
          {children}
        </ModalDialog>
      </ModalOverflow>
    </Modal>
  );
}
