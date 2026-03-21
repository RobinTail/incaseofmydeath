'use client';

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'class',
  },
  colorSchemes: {
    light: {
      palette: {
        mode: 'light',
        background: {
          default: '#ffffff',
          paper: '#f5f5f5',
        },
      },
    },
    dark: {
      palette: {
        mode: 'dark',
        background: {
          default: '#121212',
          paper: '#1e1e1e',
        },
      },
    },
  },
  defaultColorScheme: 'dark',
  components: {
    MuiIcon: {
      defaultProps: {
        className: 'material-symbols-outlined',
      },
    },
  },
});

export default theme;
