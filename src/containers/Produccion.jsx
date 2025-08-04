import { Box } from '@mui/joy';
import dayjs from 'dayjs';
import { useState, useEffect, useMemo } from 'react';
import { useConfig } from '../ConfigContext.jsx';
import ProduccionForm from '../components/Forms/ProduccionForm.jsx';
import EnhancedTable from '../components/Tables/EnhancedTable.jsx';
import ArticuloCol from '../components/Tables/ArticuloCol.jsx';
import { DatesContext } from '../Contexts.js';

let apiUrl, sqlDateFormat;

export default function Produccion() {
  ({ apiUrl, sqlDateFormat } = useConfig());
  const [url, setUrl] = useState();
  // const [machines, setMachines] = useState([]);
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({
    room: 'SEAMLESS',
    startDate: dayjs.tz().startOf('month').hour(6).minute(0).second(1),
    endDate: dayjs.tz(),
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
      startDate: dayjs
        .tz()
        .startOf('month')
        .hour(6)
        .minute(0)
        .second(1)
        .format(sqlDateFormat),
      endDate: dayjs.tz().format(sqlDateFormat),
      actual: true,
      articulo: '',
      talle: '',
      colorId: '',
    }).toString();

    // fetch(`${apiUrl}/machines/producing`)
    //   .then((res) => res.json())
    //   .then((data) => {
    //     if (!ignore) setMachines(data);
    //   })
    //   .catch((err) =>
    //     console.log('[CLIENT] Error fetching /machines/producing:', err)
    //   );

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
      // fetch(`${apiUrl}/machines/producing`)
      //   .then((res) => res.json())
      //   .then((data) => {
      //     if (!ignore) setMachines(data);
      //   })
      //   .catch((err) =>
      //     console.log('[CLIENT] Error fetching /machines/producing:', err)
      //   );

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

  const cols = [
    {
      id: 'Articulo',
      label: 'Artículo',
      align: 'right',
    },
    {
      id: 'Talle',
      label: 'Talle',
      align: 'center',
    },
    {
      id: 'Color',
      label: 'Color',
    },
    {
      id: 'Unidades',
      label: 'Unidades',
      align: 'right',
    },
    {
      id: 'Unidades',
      label: 'Docenas',
      align: 'right',
    },
  ];

  function calcProducido(row) {
    return row.Tipo === null
      ? row.Unidades
      : row.Tipo === '#'
      ? row.Unidades * 2
      : row.Unidades / 2;
  }

  function renderRow(row, i, opened, handleClick) {
    const producido = calcProducido(row);
    return [
      null, // rowClassName
      <>
        {/* Articulo */}
        <ArticuloCol
          row={row}
          isOpen={opened === `${row.Articulo}-${row.Talle}-${row.ColorId}`}
          editable={false}
          handleRowClick={handleClick}
        />
        {/* Talle */}
        <td className='text-center'>{row.Talle}</td>
        {/* Color */}
        <td>{row.Color}</td>
        {/* Unidades */}
        <td className='text-right'>
          {row.Tipo === null ? producido : `${producido} (${row.Unidades})`}
        </td>
        {/* Docenas */}
        <td className='text-right'>
          {row.Tipo === null
            ? (producido / 12).toFixed(1)
            : `${(producido / 12).toFixed(1)} (${(row.Unidades / 12).toFixed(
                1
              )})`}
        </td>
        {/* Maquinas */}
        {/* <td>
                {machines
                  .filter(
                    // match machines with articulo
                    (m) =>
                      m.StyleCode.articulo === row.Articulo &&
                      m.StyleCode.talle === row.Talle &&
                      m.StyleCode.colorId === row.ColorId
                  )
                  .map((m) => m.MachCode) // display all machines with articulo
                  .join(' - ')}
              </td> */}
      </>,
    ];
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

      <DatesContext
        value={{
          startDate: formData.startDate,
          fromMonthStart: false,
          endDate: formData.endDate,
        }}
      >
        <EnhancedTable
          cols={cols}
          rows={data}
          renderRow={renderRow}
          initOrder='asc'
          initOrderBy='Articulo'
          footer={['Total', totalUnidades || '0', totalDocenas || '0']}
          headerTop='top-[94px]'
        />
      </DatesContext>
    </Box>
  );
}
