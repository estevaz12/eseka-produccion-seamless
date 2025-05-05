import * as React from 'react';
import { createRoot } from 'react-dom/client';
import Home from './containers/Home.jsx';
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
};

root.render(
  <StyledEngineProvider injectFirst>
    <ThemeProvider theme={{ [MATERIAL_THEME_ID]: materialTheme }}>
      <JoyCssVarsProvider>
        <CssBaseline enableColorScheme />
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='es'>
          <ConfigProvider config={config}>
            <Home />
          </ConfigProvider>
        </LocalizationProvider>
      </JoyCssVarsProvider>
    </ThemeProvider>
  </StyledEngineProvider>
);
