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
import ProgAnteriores from './containers/ProgAnteriores.jsx';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import Maquinas from './containers/Maquinas.jsx';
import {
  useTheme as useJoyTheme,
  extendTheme,
  CssVarsProvider as JoyCssVarsProvider,
} from '@mui/joy/styles';
import {
  createTheme,
  ThemeProvider,
  THEME_ID as MATERIAL_THEME_ID,
} from '@mui/material/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Dashboard from './containers/Dashboard.jsx';
import { getChartsCustomizations } from './theme/charts.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/Buenos_Aires');

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

const config = {
  apiUrl: process.env.EXPRESS_URL,
  sqlDateFormat: process.env.SQL_DATE_FORMAT,
};

root.render(
  <AppProviders>
    <App />
  </AppProviders>
);

function AppProviders({ children }) {
  let joyTheme = useJoyTheme();

  const materialTheme = createTheme({
    typography: { fontFamily: joyTheme.vars.fontFamily },
    components: getChartsCustomizations(joyTheme),
  });

  joyTheme = extendTheme({
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
      JoySkeleton: {
        defaultProps: {
          animation: 'wave',
        },
      },
    },
  });

  return (
    <StyledEngineProvider enableCssLayer>
      <ThemeProvider theme={{ [MATERIAL_THEME_ID]: materialTheme }}>
        {/* For tailwind */}
        <GlobalStyles styles='@layer theme, base, mui, components, utilities;' />
        <JoyCssVarsProvider theme={joyTheme}>
          <CssBaseline />
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='es'>
            <ConfigProvider config={config}>{children}</ConfigProvider>
          </LocalizationProvider>
        </JoyCssVarsProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path='/' element={<Home />}>
          <Route index element={<Dashboard />} />
          <Route path='programada'>
            <Route path='actual' element={<Programada />} />
            <Route path='anteriores' element={<ProgAnteriores />} />
          </Route>
          <Route path='produccion' element={<Produccion />} />
          <Route path='maquinas' element={<Maquinas />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
