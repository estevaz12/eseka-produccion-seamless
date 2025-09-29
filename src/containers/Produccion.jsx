import Box from '@mui/joy/Box';
import dayjs from 'dayjs';
import { useState, useEffect, useMemo } from 'react';
import { useConfig } from '../ConfigContext.jsx';
import ProduccionForm from '../components/Forms/ProduccionForm.jsx';
import EnhancedTable from '../components/Tables/EnhancedTable.jsx';
import ArticuloCol from '../components/Tables/ArticuloCol.jsx';
import { DatesContext } from '../Contexts.js';
import { useOutletContext } from 'react-router';

let apiUrl, sqlDateFormat;

export default function Produccion() {
  ({ apiUrl, sqlDateFormat } = useConfig());
  const { room, docena } = useOutletContext();
  const [url, setUrl] = useState();
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({
    room,
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
      room,
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

    fetch(`${apiUrl}/produccion?${params}`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignore) setData(data);
      })
      .catch((err) =>
        console.error('[CLIENT] Error fetching /produccion:', err)
      );

    return () => {
      ignore = true;
    };
  }, []);

  // get data on form submission
  useEffect(() => {
    let ignore = false;
    if (url) {
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          if (!ignore)
            setData(
              data.length === 0
                ? [
                    {
                      Articulo: 'No hay datos',
                      Tipo: null,
                      Talle: null,
                      Color: null,
                      Unidades: null,
                    },
                  ]
                : data
            );
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
      labelWidth: 'min-w-16',
      pdfAlign: 'left',
      pdfRender: (row) => `${row.Articulo}${row.Tipo ? row.Tipo : ''}`,
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
      id: 'Docenas',
      label: 'Docenas',
      align: 'right',
      pdfValue: (row) => calcProducido(row) / docena,
      pdfRender: (row) => docenasStr(row),
    },
    {
      id: 'Unidades',
      label: 'Unidades',
      align: 'right',
      pdfValue: (row) => calcProducido(row),
      pdfRender: (row) => unidadesStr(row),
    },
  ];

  function calcProducido(row) {
    return row.Tipo === null
      ? row.Unidades
      : row.Tipo === '#'
      ? row.Unidades * 2
      : row.Unidades / 2;
  }

  function unidadesStr(row) {
    const producido = calcProducido(row);
    return row.Tipo === null ? producido : `${producido} (${row.Unidades})`;
  }

  function docenasStr(row) {
    const producido = calcProducido(row);
    return row.Tipo === null
      ? (producido / docena).toFixed(1)
      : `${(producido / docena).toFixed(1)} (${(row.Unidades / docena).toFixed(
          1
        )})`;
  }

  function renderRow(row, i, opened, handleClick) {
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
        <td className='font-semibold text-center'>{row.Talle}</td>
        {/* Color */}
        <td
          className='font-semibold border-x'
          style={{
            backgroundColor: row.Hex,
            color: row.WhiteText ? 'white' : 'black',
          }}
        >
          {row.Color}
        </td>
        {/* Docenas */}
        <td className='text-right'>{docenasStr(row)}</td>
        {/* Unidades */}
        <td className='text-right'>{unidadesStr(row)}</td>
      </>,
    ];
  }

  // Memoized totals
  const totalUnidades = useMemo(
    () => data.reduce((acc, row) => acc + calcProducido(row), 0),
    [data]
  );
  const totalDocenas = useMemo(
    () => data.reduce((acc, row) => acc + calcProducido(row) / docena, 0),
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
          pdfRows={data}
          renderRow={renderRow}
          initOrder='asc'
          initOrderBy='Articulo'
          footer={[
            'Total',
            Math.round(totalDocenas) || '0',
            Math.round(totalUnidades) || '0',
          ]}
          headerTop='top-[94px]'
        />
      </DatesContext>
    </Box>
  );
}
