import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0088e0', 
    },
    secondary: {
      main: '#fbf3ef',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      color: '#009688',
    },
    h5: {
      fontWeight: 500,
    },
    button: {
      textTransform: 'none', 
    },
  },
});

export default theme;
