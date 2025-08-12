import UploadFileOutlined from '@mui/icons-material/UploadFileOutlined';
import Button from '@mui/joy/Button';

export default function InputFileUpload({ onClick }) {
  return (
    <Button
      component='label'
      role={undefined}
      tabIndex={-1}
      startDecorator={<UploadFileOutlined fontSize='small' />}
      onClick={onClick}
    >
      Cargar programada
    </Button>
  );
}
