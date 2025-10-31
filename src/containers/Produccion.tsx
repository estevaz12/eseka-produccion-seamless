import Box from '@mui/joy/Box';
import dayjs from 'dayjs';
import { useState, useEffect, useMemo } from 'react';
import { useConfig } from '../ConfigContext.tsx';
import ProduccionForm from '../components/Forms/ProduccionForm.jsx';
import EnhancedTable from '../components/Tables/EnhancedTable.jsx';
import ArticuloCol from '../components/Tables/ArticuloCol.jsx';
import { DatesContext } from '../Contexts.ts';
import { useOutletContext } from 'react-router';
import { footerFormat } from '../utils/progTableUtils.ts';
import { localizedNum } from '../utils/numFormat.ts';
import {
  OutletContextType,
  ProduccionRow,
  RenderRowArgs,
  RenderRowTuple,
  TableCol,
} from '../types';

let apiUrl: string, sqlDateFormat: string;

export default function Produccion() {
  ({ apiUrl, sqlDateFormat } = useConfig());
  const { room, docena, porcExtra } = useOutletContext<OutletContextType>();
  const [url, setUrl] = useState<string>();
  const [data, setData] = useState<ProduccionRow[]>([]);
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
    const paramsObj = {
      ...formData,
      startDate: formData.startDate.format(sqlDateFormat),
      endDate: formData.endDate.format(sqlDateFormat),
    };
    const params = new URLSearchParams(
      Object.entries(paramsObj) as Array<[string, string]>
    ).toString();

    if (!ignore) setUrl(`${apiUrl}/produccion?${params}`);

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    let interval: NodeJS.Timeout;

    if (url && !ignore) {
      // get data on form submission
      fetchProduccion();

      if (formData.actual) interval = setInterval(fetchProduccion, 30000);
    }

    return () => {
      ignore = true;
      clearInterval(interval);
    };

    function fetchProduccion() {
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
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
  }, [url]);

  const cols: TableCol[] = [
    {
      id: 'Articulo',
      label: 'Artículo',
      align: 'right',
      labelWidth: 'min-w-16',
      pdfAlign: 'left',
      pdfRender: (row: ProduccionRow) =>
        `${row.Articulo}${row.Tipo ? row.Tipo : ''}`,
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
      pdfValue: (row: ProduccionRow) => calcProducido(row) / docena,
      pdfRender: (row: ProduccionRow) => docenasStr(row),
    },
    {
      id: 'Unidades',
      label: 'Unidades',
      align: 'right',
      pdfValue: (row: ProduccionRow) => calcProducido(row),
      pdfRender: (row: ProduccionRow) => unidadesStr(row),
    },
  ];

  function calcProducido(row: ProduccionRow) {
    return row.Tipo === null
      ? row.Unidades
      : row.Tipo === '#'
        ? row.Unidades * 2
        : row.Unidades / 2;
  }

  function unidadesStr(row: ProduccionRow) {
    const producido = localizedNum(calcProducido(row));
    return row.Tipo === null
      ? producido
      : `${producido} (${localizedNum(row.Unidades)})`;
  }

  function docenasStr(row: ProduccionRow) {
    const producido = calcProducido(row);
    const producidoDiv = Number((producido / docena / porcExtra).toFixed(1));
    const unidadesDiv = Number((row.Unidades / docena / porcExtra).toFixed(1));

    return row.Tipo === null
      ? localizedNum(producidoDiv)
      : `${localizedNum(producidoDiv)} (${localizedNum(unidadesDiv)})`;
  }

  function renderRow(
    ...[row, i, opened, handleClick]: RenderRowArgs<ProduccionRow>
  ): RenderRowTuple {
    return [
      null, // rowClassName
      <>
        {/* Articulo */}
        <ArticuloCol
          row={row}
          isOpen={opened === `${row.Articulo}-${row.Talle}-${row.ColorId}`}
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
    () =>
      data.reduce(
        (acc, row) => acc + calcProducido(row) / docena / porcExtra,
        0
      ),
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
            footerFormat(totalDocenas),
            footerFormat(totalUnidades),
          ]}
          headerTop='top-[94px]'
        />
      </DatesContext>
    </Box>
  );
}
