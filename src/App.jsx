import * as React from 'react';
import { createRoot } from 'react-dom/client';
import Home from './containers/Home.jsx';
import { StyledEngineProvider } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

const theme = createTheme({
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

root.render(
  <StyledEngineProvider injectFirst>
    <ThemeProvider theme={theme}>
      <Home />
    </ThemeProvider>
  </StyledEngineProvider>
);
