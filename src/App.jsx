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
import Maquinas from './containers/Maquinas.jsx';
import {
  extendTheme,
  CssVarsProvider as JoyCssVarsProvider,
} from '@mui/joy/styles';
import {
  createTheme,
  ThemeProvider,
  THEME_ID as MATERIAL_THEME_ID,
} from '@mui/material/styles';
import CssBaseline from '@mui/joy/CssBaseline';

dayjs.extend(utc);

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

const config = {
  apiUrl: process.env.EXPRESS_URL,
  sqlDateFormat: 'MM-DD-YYYY HH:mm:ss',
  stripedTableRows:
    '[&_tbody_tr:nth-of-type(even)]:bg-[var(--joy-palette-background-level1)]',
};

const materialTheme = createTheme();

const joyTheme = extendTheme({
  components: {
    // The component identifier always start with `Joy${ComponentName}`.
    JoyCheckbox: {
      styleOverrides: {
        input: {
          // theme.vars.* return the CSS variables.
          position: 'relative',
        },
      },
    },
  },
});

root.render(
  <StyledEngineProvider enableCssLayer>
    <ThemeProvider theme={{ [MATERIAL_THEME_ID]: materialTheme }}>
      {/* For tailwind */}
      <GlobalStyles styles='@layer theme, base, mui, components, utilities;' />
      <JoyCssVarsProvider theme={joyTheme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='es'>
          <ConfigProvider config={config}>
            <App />
          </ConfigProvider>
        </LocalizationProvider>
      </JoyCssVarsProvider>
    </ThemeProvider>
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
            <Route path='anteriores' element={<ProgAnteriores />} />
            <Route path='comparar' element={<ProgComparar />} />
          </Route>
          <Route path='produccion' element={<Produccion />} />
          <Route path='maquinas' element={<Maquinas />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
