import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { StyledEngineProvider } from '@mui/material';
import {
  createTheme,
  ThemeProvider,
  THEME_ID as MATERIAL_THEME_ID,
} from '@mui/material/styles';
import { CssVarsProvider as JoyCssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/es';
import { ConfigProvider } from './ConfigContext.jsx';
import { HashRouter, Navigate, Route, Routes } from 'react-router';
import Home from './containers/Home.jsx';
import Produccion from './containers/Produccion.jsx';
import Programada from './containers/Programada.jsx';
import ProgComparar from './containers/ProgComparar.jsx';
import ProgHistorica from './containers/ProgHistorica.jsx';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

const materialTheme = createTheme({
  cssVariables: true,
  components: {
    MuiPopover: {
      defaultProps: {
        container: rootElement,
      },
    },
    MuiPopper: {
      defaultProps: {
        container: rootElement,
      },
    },
    MuiDialog: {
      defaultProps: {
        container: rootElement,
      },
    },
    MuiModal: {
      defaultProps: {
        container: rootElement,
      },
    },
  },
});

const config = {
  apiUrl: process.env.EXPRESS_URL,
  sqlDateFormat: 'MM-DD-YYYY HH:mm:ss',
};

root.render(
  <StyledEngineProvider injectFirst>
    <ThemeProvider theme={{ [MATERIAL_THEME_ID]: materialTheme }}>
      <JoyCssVarsProvider>
        <CssBaseline enableColorScheme />
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
          <Route index element={<Navigate to='/programada' replace />} />
          <Route path='programada'>
            <Route index element={<Programada />} />
            <Route path='comparar' element={<ProgComparar />} />
            <Route path='historica' element={<ProgHistorica />} />
          </Route>
          <Route path='produccion' element={<Produccion />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
