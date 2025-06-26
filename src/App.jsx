import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { StyledEngineProvider } from '@mui/material/styles';
import GlobalStyles from '@mui/joy/GlobalStyles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/es';
import { ConfigProvider } from './ConfigContext.jsx';
import { HashRouter, Route, Routes } from 'react-router';
import Home from './containers/Home.jsx';
import Produccion from './containers/Produccion.jsx';
import Programada from './containers/Programada.jsx';
import ProgComparar from './containers/ProgComparar.jsx';
import ProgAnteriores from './containers/ProgAnteriores.jsx';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

const config = {
  apiUrl: process.env.EXPRESS_URL,
  sqlDateFormat: 'MM-DD-YYYY HH:mm:ss',
};

root.render(
  <StyledEngineProvider enableCssLayer>
    <GlobalStyles styles='@layer theme, base, mui, components, utilities;' />
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='es'>
      <ConfigProvider config={config}>
        <App />
      </ConfigProvider>
    </LocalizationProvider>
  </StyledEngineProvider>
);

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path='/' element={<Home />}>
          {/* Actual */}
          <Route index element={<Programada />} />
          <Route path='programada'>
            <Route path='comparar' element={<ProgComparar />} />
            <Route path='anteriores' element={<ProgAnteriores />} />
          </Route>
          <Route path='produccion' element={<Produccion />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
