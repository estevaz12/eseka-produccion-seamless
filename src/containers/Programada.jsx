// TODO fix insertAll

import {
  Box,
  Typography,
  Button,
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  FormControl,
  FormLabel,
  Input,
  FormHelperText,
  ModalOverflow,
} from '@mui/joy';
import InputFileUpload from '../components/InputFileUpload.jsx';
import { useEffect, useRef, useState } from 'react';
import { useConfig } from '../ConfigContext.jsx';
import DataTable from '../components/DataTable.jsx';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import ColorFormInputs from '../components/ColorFormInputs.jsx';

// to avoid useEffect dependency issues
let apiUrl, sqlDateFormat;

export default function Programada() {
  [apiUrl, sqlDateFormat] = [useConfig().apiUrl, useConfig().sqlDateFormat];
  const [currTotal, setCurrTotal] = useState();
  const [filePath, setFilePath] = useState();
  const [programada, setProgramada] = useState();
  const [diff, setDiff] = useState();
  const diffMounted = useRef(false);
  const [newTargets, setNewTargets] = useState();
  const [newArticuloData, setNewArticuloData] = useState([]);
  const [articuloFormData, setArticuloFormData] = useState({});
  const loadType = useRef('');

  useEffect(() => {
    if (localStorage.getItem('progStartDate')) {
      fetchCurrTotal();
    }
  }, []);

  useEffect(() => {
    if (filePath) {
      const params = new URLSearchParams({ path: filePath }).toString();
      fetch(`${apiUrl}/programada/file?${params}`)
        .then((res) => res.json())
        .then((data) => setProgramada(data))
        .catch((err) => console.error('[CLIENT] Error fetching data:', err));
    }
  }, [filePath]);

  function handleCompare() {
    if (programada) {
      fetch(`${apiUrl}/programada/compare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: localStorage.getItem('progStartDate'),
          new: programada.rows,
        }),
      })
        .then((res) => res.json())
        .then((data) => setDiff(data))
        .catch((err) => console.error('[CLIENT] Error fetching data:', err));
    }
  }

  // TODO: show form/modal to insert new articulo data
  async function handleProgramadaUpdate() {
    if (diff) {
      // Check if articulo, color codes, and color distr exist and handle accordingly
      let prevArticulo; // to avoid duplicate fetches

      for (const row of diff.added) {
        // TODO: change to be parallel
        if (prevArticulo !== row.articulo) {
          let articulo;
          try {
            let res = await fetch(`${apiUrl}/articulo/${row.articulo}`);
            articulo = await res.json();
          } catch (err) {
            console.error('[CLIENT] Error fetching articulo:', err);
          }

          // if else to avoid making unnecessary fetches if articulo doesn't exist
          if (!articulo || articulo.length === 0) {
            // ask for Tipo, ColorDistr, ColorCodes
            setNewArticuloData((prev) => [
              ...prev,
              {
                articuloExists: false, // to know if an articulo insert is needed
                articulo: row.articulo,
                tipo: null,
                colorDistr: null,
                colorCodes: null,
              },
            ]);
          } else {
            // If articulo exists, check if color codes and color distr exists
            const [colorDistr, colorCodes] = await Promise.all([
              fetch(`${apiUrl}/articulo/${articulo[0].Articulo}/colorDistr`)
                .then((res) => res.json())
                .catch((err) =>
                  console.error('[CLIENT] Error fetching colorDistr:', err)
                ),
              fetch(`${apiUrl}/articulo/${articulo[0].Articulo}/colorCodes`)
                .then((res) => res.json())
                .catch((err) =>
                  console.error('[CLIENT] Error fetching colorCodes:', err)
                ),
            ]);

            console.log(
              JSON.stringify(
                {
                  articuloExists: true, // no need to insert articulo
                  articulo: articulo[0].Articulo,
                  tipo: articulo[0].Tipo,
                  // if undefined or length 0, results in null
                  colorDistr: colorDistr?.length > 0 ? colorDistr : null,
                  colorCodes: colorCodes?.length > 0 ? colorCodes : null,
                },
                null,
                2
              )
            );

            // if color codes and color distr exist, don't add to newArticuloData
            if (!(colorDistr?.length > 0 && colorCodes?.length > 0)) {
              setNewArticuloData((prev) => [
                ...prev,
                {
                  articuloExists: true, // no need to insert articulo
                  articulo: articulo[0].Articulo,
                  tipo: articulo[0].Tipo,
                  // if undefined or length 0, results in null
                  colorDistr: colorDistr?.length > 0 ? colorDistr : null,
                  colorCodes: colorCodes?.length > 0 ? colorCodes : null,
                },
              ]);
            }
          }
        }

        prevArticulo = row.articulo;
      }

      // move from added to modified to trigger useEffect after inserting new articulos
      setDiff((prev) => ({
        ...prev,
        modified: [...prev.modified, ...prev.added],
        added: [],
      }));
    }
  }

  function handleNewArticuloSubmit(e, articulo, articuloExists) {
    // articuloFormData = {
    //  tipo,
    //  colorDistr: [{color, porcentaje}], -- won't be there if no need to insert
    //  colorCodes: [{color, code}]  -- won't be there if no need to insert
    // }
    e.preventDefault();
    const data = { articulo, ...articuloFormData };
    if (!articuloExists) {
      // if articulo doesn't exist, insert articulo, colorDistr, and colorCodes
      fetch(`${apiUrl}/articulo/insertWithColors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).catch((err) => console.error('[CLIENT] Error fetching data:', err));
    } else {
      // if articulo exists, check if colorCodes and colorDistr exists
      // if not, insert them
      if (articuloFormData.colorDistr) {
        fetch(`${apiUrl}/colorDistr/insert`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            articulo: data.articulo,
            colorDistr: data.colorDistr, // [{color, porcentaje}]
          }),
        }).catch((err) => console.error('[CLIENT] Error fetching data:', err));
      }

      if (articuloFormData.colorCodes) {
        fetch(`${apiUrl}/colorCodes/insert`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            articulo: data.articulo,
            colorCodes: data.colorCodes, // [{color, code}]
          }),
        }).catch((err) => console.error('[CLIENT] Error fetching data:', err));
      }
    }

    setNewArticuloData((prev) => prev.slice(1)); // Remove first item
    setArticuloFormData({});
  }

  // TODO: add fetch cancel to all useEffects
  // Insert diff updates after validating new articulos
  useEffect(() => {
    // can't make an async useEffect, instead use inner function
    async function insertUpdates() {
      try {
        const res = await fetch(`${apiUrl}/programada/update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(diff),
        });
        const data = await res.json();
        fetchNewTargets(data);
      } catch (err) {
        console.error('[CLIENT] Error fetching data:', err);
      }
    }

    function insertAll() {
      if (programada) {
        fetch(`${apiUrl}/programada/insertAll`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(programada.rows),
        })
          .then(() =>
            localStorage.setItem('progStartDate', dayjs().format(sqlDateFormat))
          )
          .catch((err) => console.error('[CLIENT] Error fetching data:', err));
      }
    }

    if (diff && !diffMounted.current) {
      diffMounted.current = true;
      return; // skip when diff is first set
    }

    if (diff && diff.added.length === 0 && newArticuloData.length === 0) {
      if (loadType.current === 'update') insertUpdates();
      else if (loadType.current === 'insert') insertAll();
      fetchCurrTotal();
      setDiff();
    }
  }, [diff, newArticuloData, programada]);

  async function handleUpload() {
    // Reset states before uploading a new file
    diffMounted.current = false;
    setProgramada();
    setDiff();
    setNewTargets();
    setFilePath(await window.electronAPI.openFile());
  }

  function fetchCurrTotal() {
    fetch(`${apiUrl}/programada/total/${localStorage.getItem('progStartDate')}`)
      .then((res) => res.json())
      .then((data) => setCurrTotal(data[0].Total)) // single-record object
      .catch((err) => console.error('[CLIENT] Error fetching data:', err));
  }

  function fetchNewTargets(inserted) {
    fetch(`${apiUrl}/programada/calculateNewTargets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inserted), // inserted prog updates
    })
      .then((res) => res.json())
      .then((data) => setNewTargets(data))
      .catch((err) => console.error('[CLIENT] Error fetching data:', err));
  }

  return (
    <Box>
      <Typography>
        Total Actual:{' '}
        {currTotal !== undefined
          ? currTotal
          : localStorage.getItem('progStartDate')
          ? 'Cargando...'
          : 0}
      </Typography>
      <InputFileUpload onClick={handleUpload} />
      <Typography>File path: {filePath}</Typography>

      <DatePicker
        label='Fecha de inicio'
        value={
          localStorage.getItem('progStartDate')
            ? dayjs(localStorage.getItem('progStartDate'))
            : null
        }
        onChange={(newValue) => {
          if (newValue) {
            localStorage.setItem(
              'progStartDate',
              newValue.format(sqlDateFormat)
            );
            fetchCurrTotal();
          }
        }}
        disableFuture
        disabled={localStorage.getItem('progStartDate') !== null}
      />

      {programada && !diff && !newTargets && (
        <Button
          onClick={handleCompare}
          disabled={localStorage.getItem('progStartDate') !== null}
        >
          Comparar
        </Button>
      )}

      {diff &&
        !(
          diff.added.length === 0 &&
          diff.modified.length === 0 &&
          diff.deleted.length === 0
        ) && (
          <>
            <Button
              disabled={localStorage.getItem('progStartDate') === null}
              onClick={() => {
                localStorage.removeItem('progStartDate');
                setCurrTotal(0); // to trigger a re-render
              }}
            >
              Reset fecha
            </Button>

            <Button
              onClick={() => {
                loadType.current = 'update';
                handleProgramadaUpdate();
              }}
              disabled={localStorage.getItem('progStartDate') === null}
            >
              Cargar cambios
            </Button>

            <Button
              onClick={() => {
                loadType.current = 'insert';
                handleProgramadaUpdate();
              }}
              disabled={localStorage.getItem('progStartDate') !== null}
            >
              Cargar todo
            </Button>
          </>
        )}

      {/* render one Modal at a time */}
      {newArticuloData.length > 0 && (
        <Modal open>
          <ModalOverflow>
            <ModalDialog>
              <DialogTitle>
                Agregar artículo {newArticuloData[0].articulo}
              </DialogTitle>
              <DialogContent>
                Por favor, ingrese los datos del artículo.
              </DialogContent>
              <form
                onSubmit={(e) =>
                  handleNewArticuloSubmit(
                    e,
                    newArticuloData[0].articulo,
                    newArticuloData[0].articuloExists
                  )
                }
              >
                <Box>
                  {/* TODO: validation */}
                  <FormControl>
                    <FormLabel>Articulo</FormLabel>
                    <Input value={newArticuloData[0].articulo} disabled />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Tipo (si aplica)</FormLabel>
                    <Input
                      value={newArticuloData[0].tipo}
                      onChange={(e) =>
                        setArticuloFormData({
                          ...articuloFormData,
                          tipo: e.target.value,
                        })
                      }
                      disabled={newArticuloData[0].tipo}
                      maxLength={1}
                      pattern='%|\$|#'
                      // slotProps={{
                      //   input: {
                      //     readOnly: newArticuloData[0].tipo ? true : false,
                      //     maxLength: 1,
                      //     pattern: '%|$|#',
                      //   },
                      // }}
                    />
                    <FormHelperText>
                      <Typography variant='solid' color='primary'>
                        #
                      </Typography>
                      &nbsp;si se divide a la mitad.&nbsp;
                      <Typography variant='solid' color='primary'>
                        $
                      </Typography>
                      &nbsp;o&nbsp;
                      <Typography variant='solid' color='primary'>
                        %
                      </Typography>
                      &nbsp;si se duplica.
                    </FormHelperText>
                  </FormControl>
                  {/* TODO: 
                    - input colorDistr first
                      --> input field where you can add more as you go
                    - based on the num of colors in colorDistr, amount of colorCode input fields
                  */}
                  {newArticuloData[0].colorDistr ? (
                    // colorDistr won't exist in articuloFormData
                    <Typography>Distribución ya cargada</Typography>
                  ) : (
                    <ColorFormInputs
                      fieldName='colorDistr'
                      title='Distribución de colores'
                      label2='Porcentaje'
                      input2Key='porcentaje'
                      input2Attrs={{ type: 'number', min: 1, max: 100 }}
                      articuloFormData={articuloFormData}
                      setArticuloFormData={setArticuloFormData}
                    />
                  )}

                  {newArticuloData[0].colorCodes ? (
                    // colorCodes won't exist in articuloFormData
                    <Typography>Códigos ya cargados</Typography>
                  ) : (
                    <ColorFormInputs
                      fieldName='colorCodes'
                      title='Códigos de colores'
                      label2='Código'
                      input2Key='code'
                      input2Attrs={{ type: 'text' }}
                      articuloFormData={articuloFormData}
                      setArticuloFormData={setArticuloFormData}
                    />
                  )}
                </Box>
                <Button type='submit'>Agregar artículo</Button>
              </form>
            </ModalDialog>
          </ModalOverflow>
        </Modal>
      )}

      {programada && <Typography>Total: {programada.total}</Typography>}
      {programada && !diff && !newTargets && (
        <DataTable
          cols={['Artículo', 'Talle', 'A Producir']} //, 'Producido', 'Falta']}
        >
          {programada.rows.map((row, i) => (
            <tr key={i}>
              <td>{row.articulo}</td>
              <td>{row.talle}</td>
              <td>{row.aProducir}</td>
              {/* <td>{row.producido}</td>
              <td>{row.falta}</td> */}
            </tr>
          ))}
        </DataTable>
      )}

      {diff && (
        <Box>
          <Box>
            <Typography>Agregado</Typography>
            <DataTable
              cols={['Artículo', 'Talle', 'A Producir']} //, 'Producido', 'Falta']}
            >
              {diff.added.map((row, i) => (
                <tr key={i}>
                  <td>{row.articulo}</td>
                  <td>{row.talle}</td>
                  <td>{row.aProducir}</td>
                  {/* <td>{row.producido}</td>
            <td>{row.falta}</td> */}
                </tr>
              ))}
            </DataTable>
          </Box>

          <Box>
            <Typography>Modificado</Typography>
            <DataTable
              cols={['Articulo', 'Talle', 'A Producir']} //, 'Producido', 'Falta']}
            >
              {diff.modified.map((row, i) => (
                <tr key={i}>
                  <td>{row.articulo}</td>
                  <td>{row.talle}</td>
                  <td>{row.aProducir}</td>
                  {/* <td>{row.producido}</td>
            <td>{row.falta}</td> */}
                </tr>
              ))}
            </DataTable>

            <Typography>Eliminado</Typography>
            <DataTable
              cols={['Articulo', 'Talle', 'A Producir']} //, 'Producido', 'Falta']}
            >
              {diff.deleted.map((row, i) => (
                <tr key={i}>
                  <td>{row.articulo}</td>
                  <td>{row.talle}</td>
                  <td>{row.aProducir}</td>
                  {/* <td>{row.producido}</td>
            <td>{row.falta}</td> */}
                </tr>
              ))}
            </DataTable>
          </Box>
        </Box>
      )}

      {newTargets && (
        <Typography
          component='pre'
          sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
        >
          {JSON.stringify(newTargets, null, 2)}
        </Typography>
      )}
    </Box>
  );
}
