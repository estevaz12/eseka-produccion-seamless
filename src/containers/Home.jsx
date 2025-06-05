import { Typography } from '@mui/joy';
import { useEffect, useState } from 'react';
import { useConfig } from '../ConfigContext.jsx';
import Programada from './Programada.jsx';
// import Produccion from './Produccion.jsx';
import ModalWrapper from '../components/ModalWrapper.jsx';
import NewColorCodeForm from '../components/NewColorCodeForm.jsx';

let apiUrl;

export default function Home() {
  apiUrl = useConfig().apiUrl;
  const [newColorCodes, setNewColorCodes] = useState([]);
  const [colors, setColors] = useState([]);

  // check for newColorCodes on load
  useEffect(() => {
    fetch(`${apiUrl}/machines/newColorCodes`)
      .then((res) => res.json())
      .then((data) => setNewColorCodes(data))
      .catch((err) =>
        console.error('[CLIENT] Error fetching /machines/newColorCodes:', err)
      );
  }, []);

  // get colors for form
  useEffect(() => {
    if (newColorCodes.length > 0) {
      fetch(`${apiUrl}/colors`)
        .then((res) => res.json())
        .then((data) => setColors(data))
        .catch((err) => console.error('[CLIENT] Error fetching /colors:', err));
    }
  }, [newColorCodes]);

  return (
    <>
      <Programada />

      {newColorCodes.length > 0 && (
        <ModalWrapper
          title={
            <>
              Agregar código de color -{' '}
              <Typography variant='solid' color='primary'>
                {newColorCodes[0].StyleCode.styleCode}
              </Typography>
            </>
          }
          content={
            <Typography>
              Se encontró el código&nbsp;
              <Typography variant='solid'>
                {newColorCodes[0].StyleCode.color}
              </Typography>
              &nbsp;para el art.&nbsp;
              <Typography variant='solid'>
                {newColorCodes[0].StyleCode.articulo}
              </Typography>
              &nbsp;en la máq.&nbsp;
              <Typography variant='solid'>
                {newColorCodes[0].MachCode}
              </Typography>
              . Por favor, víncule el color correspondiente.
            </Typography>
          }
        >
          <NewColorCodeForm
            newColorCode={newColorCodes[0]}
            colors={colors}
            setNewColorCodes={setNewColorCodes}
          />
        </ModalWrapper>
      )}
    </>
  );
}
