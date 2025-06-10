import { Typography } from '@mui/joy';
import { useEffect, useState } from 'react';
import { useConfig } from '../ConfigContext.jsx';
import ModalWrapper from '../components/ModalWrapper.jsx';
import NewColorCodeForm from '../components/NewColorCodeForm.jsx';
import { Outlet } from 'react-router';
import NavBar from '../components/NavBar.jsx';

let apiUrl;

// TODO handle casaes for newColorCodes where articulo doesn't exist
export default function Home() {
  apiUrl = useConfig().apiUrl;
  const [newColorCodes, setNewColorCodes] = useState([]);
  const [colors, setColors] = useState([]);

  // check for newColorCodes on load and then every hour
  useEffect(() => {
    let ignore = false;
    // fetch and repeat every hour
    fetch(`${apiUrl}/machines/newColorCodes`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignore) setNewColorCodes(data);
      })
      .catch((err) =>
        console.error('[CLIENT] Error fetching /machines/newColorCodes:', err)
      );

    const intervalId = setInterval(() => {
      fetch(`${apiUrl}/machines/newColorCodes`)
        .then((res) => res.json())
        .then((data) => {
          if (!ignore) setNewColorCodes(data);
        })
        .catch((err) =>
          console.error('[CLIENT] Error fetching /machines/newColorCodes:', err)
        );
    }, 1 * 3600 * 1000); // update every hour

    return () => {
      clearInterval(intervalId);
      ignore = true;
    };
  }, []);

  // get colors for form
  useEffect(() => {
    let ignore = false;
    if (newColorCodes.length > 0) {
      fetch(`${apiUrl}/colors`)
        .then((res) => res.json())
        .then((data) => {
          if (!ignore) setColors(data);
        })
        .catch((err) => console.error('[CLIENT] Error fetching /colors:', err));
    }

    return () => {
      ignore = true;
    };
  }, [newColorCodes]);

  return (
    <>
      <NavBar />

      <Outlet />

      {/* Modal for new Color Codes */}
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
