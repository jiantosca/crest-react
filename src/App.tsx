import { ThemeProvider, createTheme } from '@mui/material/styles';
import './App.css';
import { AppLayout } from './components/AppLayout';
import * as React from 'react';
import { Paper } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';

function App() {
  const renderCounter  = React.useRef(0)
  console.log(`<App /> rendered ${++renderCounter.current} times`)

  //Dark Mode!! https://mui.com/material-ui/customization/dark-mode/
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  console.log('prefersDarkMode: ' + prefersDarkMode)
  const appTheme = createTheme ({
    palette: {
      mode: "dark",
    }
  });

  return (
    <ThemeProvider theme={appTheme}>
      {/* <Paper> */}
        <AppLayout/>
      {/* </Paper> */}
    </ThemeProvider>
  );
}

export default App;