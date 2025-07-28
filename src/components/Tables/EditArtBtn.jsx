import { Edit } from '@mui/icons-material';
import { useState } from 'react';
import EditArticuloForm from '../Forms/EditArticuloForm.jsx';
import ModalWrapper from '../ModalWrapper.jsx';
import { useConfig } from '../../ConfigContext.jsx';

export default function EditArtBtn({ articulo, tipo }) {
  const apiUrl = useConfig().apiUrl;
  const [openForm, setOpenForm] = useState(false);
  const [articuloData, setArticuloData] = useState({});

  async function handleClick() {
    try {
      const res = await fetch(
        `${apiUrl}/articulo/${articulo}/currentColorDistr`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await res.json();

      const colorDistr = [];
      data.forEach((row) => {
        colorDistr.push({
          color: row.Color,
          porcentaje: row.Porcentaje,
        });
      });
      setArticuloData({ articulo, tipo, colorDistr });
      setOpenForm(true);
    } catch (err) {
      console.error(
        `[CLIENT] Error fetching /articulo/${articulo}/currentColorDistr:`,
        err
      );
    }
  }

  return (
    <>
      <Edit
        size='small'
        onClick={handleClick}
        className='invisible group-hover/art:visible'
      />

      {openForm && (
        <ModalWrapper
          title='Editar artículo'
          content='Para editar otros datos, pida las modificaciones a la programada y carguela de nuevo.'
          handleClose={() => setOpenForm(false)}
          contentClassName='w-sm'
        >
          <EditArticuloForm articuloData={articuloData} />
        </ModalWrapper>
      )}
    </>
  );
}
