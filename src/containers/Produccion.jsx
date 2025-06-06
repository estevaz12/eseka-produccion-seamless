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

    fetch(`${apiUrl}/produccion?${params}`)
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.log('[CLIENT] Error fetching data:', err));
  }, []);

  // get data on form submission
  useEffect(() => {
    if (url) {
      fetch(url)
        .then((res) => res.json())
        .then((data) => setData(data))
        .catch((err) => console.log('[CLIENT] Error fetching data:', err));
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
        cols={[
          'Artículo',
          'Talle',
          'Color',
          'Unidades',
          'Docenas',
          // 'En Producción',
        ]}
      >
        {data.map((row, i) => (
          <tr key={i}>
            <td>{row.Articulo}</td>
            <td>{row.Talle}</td>
            <td>{row.Color}</td>
            <td>{row.Unidades}</td>
            <td>{(row.Unidades / 12).toFixed(1)}</td>
            {/* <td>{row.Produciendo}</td> */}
          </tr>
        ))}
      </DataTable>
    </Box>
  );
}
