import { Typography } from '@mui/joy';
import { useEffect, useState } from 'react';
import { useConfig } from '../ConfigContext.jsx';
import ModalWrapper from '../components/ModalWrapper.jsx';
import NewColorCodeForm from '../components/NewColorCodeForm.jsx';
import { Outlet } from 'react-router';
import NavBar from '../components/NavBar.jsx';

let apiUrl;

export default function Home() {
  apiUrl = useConfig().apiUrl;
  const [newColorCodes, setNewColorCodes] = useState(() =>
    JSON.parse(localStorage.getItem('newColorCodes') || '[]')
  );

  // check for newColorCodes on load and then every hour
  useEffect(() => {
    let ignore = false;
    function fetchNewColorCodes() {
      fetch(`${apiUrl}/machines/newColorCodes`)
        .then((res) => res.json())
        .then((newCodes) => {
          if (!ignore) {
            // Whenever you update localStorage, also update state:
            const currCodes = JSON.parse(
              localStorage.getItem('newColorCodes') || '[]'
            );
            // Make sure codes in localStorage are unique. Otherwise, the same
            // codes will be added every hour
            const uniqueNewCodes = newCodes.filter(
              (newCode) =>
                !currCodes.some(
                  (curr) =>
                    curr.StyleCode.styleCode === newCode.StyleCode.styleCode
                )
            );
            if (uniqueNewCodes.length > 0) {
              const updatedCodes = [...currCodes, ...uniqueNewCodes];
              localStorage.setItem(
                'newColorCodes',
                JSON.stringify(updatedCodes)
              );
              setNewColorCodes(updatedCodes);
            } else {
              // If no new codes, just update the state with the same codes
              setNewColorCodes(currCodes);
            }
          }
        })
        .catch((err) =>
          console.error('[CLIENT] Error fetching /machines/newColorCodes:', err)
        );
    }

    // fetch and repeat every hour
    fetchNewColorCodes();

    const intervalId = setInterval(() => {
      fetchNewColorCodes();
    }, 1 * 3600 * 1000); // update every hour

    return () => {
      clearInterval(intervalId);
      ignore = true;
    };
  }, []);

  return (
    <>
      <NavBar />

      <Outlet context={setNewColorCodes} />

      {/* Modal for new Color Codes */}
      {newColorCodes.length > 0 && (
        <ModalWrapper
          title={
            <>
              Agregar código de color -{' '}
              <Typography variant='solid' color='primary'>
                {newColorCodes[newColorCodes.length - 1].StyleCode.styleCode}
              </Typography>
            </>
          }
          content={
            <Typography>
              Se encontró el código&nbsp;
              <Typography variant='solid'>
                {newColorCodes[newColorCodes.length - 1].StyleCode.color}
              </Typography>
              &nbsp;para el art.&nbsp;
              <Typography variant='solid'>
                {newColorCodes[newColorCodes.length - 1].StyleCode.articulo}
              </Typography>
              &nbsp;talle&nbsp;
              <Typography variant='solid'>
                {newColorCodes[newColorCodes.length - 1].StyleCode.talle}
              </Typography>
              &nbsp;en la máq.&nbsp;
              <Typography variant='solid'>
                {newColorCodes[newColorCodes.length - 1].MachCode}
              </Typography>
              . Por favor, víncule el color correspondiente.
            </Typography>
          }
        >
          <NewColorCodeForm
            newColorCode={newColorCodes[newColorCodes.length - 1]}
            setNewColorCodes={setNewColorCodes}
          />
        </ModalWrapper>
      )}
    </>
  );
}
