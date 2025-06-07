// TODO - join with machines to show current production
import { Box } from '@mui/joy';
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { useConfig } from '../ConfigContext.jsx';
import DataTable from '../components/DataTable.jsx';
import ProduccionForm from '../components/ProduccionForm.jsx';

let apiUrl, sqlDateFormat;

export default function Produccion() {
  [apiUrl, sqlDateFormat] = [useConfig().apiUrl, useConfig().sqlDateFormat];
  const [url, setUrl] = useState();
  const [machines, setMachines] = useState([]);
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({
    room: 'SEAMLESS',
    startDate: dayjs().startOf('month').add(6, 'hour').add(1, 'second'),
    endDate: dayjs(),
    actual: true,
    articulo: '',
    talle: '',
    colorId: '',
  });

  // get all on load
  useEffect(() => {
    const params = new URLSearchParams({
      room: 'SEAMLESS',
      startDate: dayjs()
        .startOf('month')
        .add(6, 'hour')
        .add(1, 'second')
        .format(sqlDateFormat),
      endDate: dayjs().format(sqlDateFormat),
      actual: true,
      articulo: '',
      talle: '',
      colorId: '',
    }).toString();

    fetch(`${apiUrl}/machines/producing`)
      .then((res) => res.json())
      .then((data) => setMachines(data))
      .catch((err) =>
        console.log('[CLIENT] Error fetching /machines/producing:', err)
      );

    fetch(`${apiUrl}/produccion?${params}`)
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.log('[CLIENT] Error fetching /produccion:', err));
  }, []);

  // get data on form submission
  useEffect(() => {
    if (url) {
      fetch(`${apiUrl}/machines/producing`)
        .then((res) => res.json())
        .then((data) => setMachines(data))
        .catch((err) =>
          console.log('[CLIENT] Error fetching /machines/producing:', err)
        );

      fetch(url)
        .then((res) => res.json())
        .then((data) => setData(data))
        .catch((err) =>
          console.log('[CLIENT] Error fetching /produccion:', err)
        );
    }
  }, [url]);

  return (
    <Box>
      <ProduccionForm
        formData={formData}
        setFormData={setFormData}
        setUrl={setUrl}
      />

      <DataTable
        cols={['Artículo', 'Talle', 'Color', 'Unidades', 'Docenas', 'Máquinas']}
      >
        {data.map((row, i) => (
          <tr key={i}>
            <td>{row.Articulo}</td>
            <td>{row.Tipo}</td>
            <td>{row.Talle}</td>
            <td>{row.Color}</td>
            <td>
              {row.Tipo === null
                ? row.Unidades
                : row.Tipo === '#'
                ? `${row.Unidades / 2} (${row.Unidades})`
                : `${row.Unidades * 2} (${row.Unidades})`}
            </td>
            <td>
              {row.Tipo === null
                ? (row.Unidades / 12).toFixed(1)
                : row.Tipo === '#'
                ? `${(row.Unidades / 2 / 12).toFixed(1)} (${(
                    row.Unidades / 12
                  ).toFixed(1)})`
                : `${((row.Unidades * 2) / 12).toFixed(1)} (${(
                    row.Unidades / 12
                  ).toFixed(1)})`}
            </td>
            <td>
              {machines
                .filter(
                  // match machines with articulo
                  (m) =>
                    m.StyleCode.articulo === Math.floor(row.Articulo) &&
                    m.StyleCode.talle === row.Talle &&
                    m.StyleCode.colorId === row.ColorId
                )
                .map((m) => m.MachCode) // display all machines with articulo
                .join('-')}
            </td>
          </tr>
        ))}
      </DataTable>
    </Box>
  );
}
