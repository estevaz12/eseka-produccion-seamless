import { Box } from '@mui/joy';
import dayjs from 'dayjs';
import { useState, useEffect, useMemo } from 'react';
import { useConfig } from '../ConfigContext.jsx';
import DataTable from '../components/DataTable.jsx';
import ProduccionForm from '../components/ProduccionForm.jsx';

let apiUrl, sqlDateFormat;

// TODO add totals
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
    let ignore = false;
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
      .then((data) => {
        if (!ignore) setMachines(data);
      })
      .catch((err) =>
        console.log('[CLIENT] Error fetching /machines/producing:', err)
      );

    fetch(`${apiUrl}/produccion?${params}`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignore) setData(data);
      })
      .catch((err) => console.log('[CLIENT] Error fetching /produccion:', err));

    return () => {
      ignore = true;
    };
  }, []);

  // get data on form submission
  useEffect(() => {
    let ignore = false;
    if (url) {
      fetch(`${apiUrl}/machines/producing`)
        .then((res) => res.json())
        .then((data) => {
          if (!ignore) setMachines(data);
        })
        .catch((err) =>
          console.log('[CLIENT] Error fetching /machines/producing:', err)
        );

      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          if (!ignore) setData(data);
        })
        .catch((err) =>
          console.log('[CLIENT] Error fetching /produccion:', err)
        );
    }

    return () => {
      ignore = true;
    };
  }, [url]);

  function calcProducido(row) {
    return row.Tipo === null
      ? row.Unidades
      : row.Tipo === '#'
      ? row.Unidades * 2
      : row.Unidades / 2;
  }

  // Memoized totals
  const totalUnidades = useMemo(
    () => data.reduce((acc, row) => acc + Math.round(calcProducido(row)), 0),
    [data]
  );
  const totalDocenas = useMemo(
    () =>
      data.reduce((acc, row) => acc + Math.round(calcProducido(row) / 12), 0),
    [data]
  );

  return (
    <Box>
      <ProduccionForm
        formData={formData}
        setFormData={setFormData}
        setUrl={setUrl}
      />

      <DataTable
        cols={['Artículo', 'Talle', 'Color', 'Unidades', 'Docenas', 'Máquinas']}
        tfoot={['', '', 'Total', totalUnidades, totalDocenas, '']}
      >
        {data.map((row, i) => {
          const producido = calcProducido(row);

          return (
            <tr key={i}>
              {/* Articulo */}
              <td>{`${row.Articulo}${row.Tipo ? row.Tipo : ''}`}</td>
              {/* Talle */}
              <td>{row.Talle}</td>
              {/* Color */}
              <td>{row.Color}</td>
              {/* Unidades */}
              <td>
                {row.Tipo === null
                  ? producido
                  : `${producido} (${row.Unidades})`}
              </td>
              {/* Docenas */}
              <td>
                {row.Tipo === null
                  ? (producido / 12).toFixed(1)
                  : `${(producido / 12).toFixed(1)} (${(
                      row.Unidades / 12
                    ).toFixed(1)})`}
              </td>
              {/* Maquinas */}
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
                  .join(' - ')}
              </td>
            </tr>
          );
        })}
      </DataTable>
    </Box>
  );
}
