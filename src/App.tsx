import './App.css';
import * as React from 'react';
//import useMediaQuery from '@mui/material/useMediaQuery';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { RequestBuilder } from './components/RequestBuilder'
import { Stack } from '@mui/material';
import { HttpResponse } from './components/HttpResponse';
import { TempUtils } from './support/TempUtils';
import { DrawerContext, DrawerState } from './support/Context';
import { AppDrawer } from './components/AppDrawer';


const drawerWidth = 260
const Main = styled('main', { shouldForwardProp: (prop) => { return prop !== 'open' } })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

function App() {
  const renderCounter = React.useRef(0)
  console.log(`<App /> rendered ${++renderCounter.current} times`)

  //Dark Mode!! https://mui.com/material-ui/customization/dark-mode/
  // pretty big headache to use media query *and* toggle in the ui. For now
  // we'll default to dark mode and ignore system prefs. User can just 
  // use toggle in ui to change. Maybe we can use local storage that is 
  // initially set with media query, then after that everythign is driven
  // from UI toggle switch.
  // const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  const [drawerState, setDrawerState] = React.useState<DrawerState>({
    isOpen: false,
    isDarkMode: true,//pull from local storage or just stick with 
    width: drawerWidth,
    toggleDrawer: () => {
      drawerState.isOpen = !drawerState.isOpen
      setDrawerState({ ...drawerState })
    },
    toggleDarkMode: () => {
      drawerState.isDarkMode = !drawerState.isDarkMode
      setDrawerState({ ...drawerState })
    }
  });

  const appTheme = createTheme({
    palette: {
      mode: drawerState.isDarkMode ? 'dark' : 'light',
    },
    transitions: {
      duration: {
        leavingScreen: 0,
        enteringScreen: 0
      }
    }
  });

  return (
    <ThemeProvider theme={appTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <DrawerContext.Provider value={drawerState}>
        <AppDrawer />
        <Main open={drawerState.isOpen} sx={{ p: 0, border: '0px solid black' }}>
            <RequestBuilder />
            <Stack rowGap={2.5} marginBottom={5}>
              <HttpResponse exchange={TempUtils.httpExchangeContext1}></HttpResponse>
              <HttpResponse exchange={TempUtils.httpExchangeContext2}></HttpResponse>
            </Stack>
        </Main>
        </DrawerContext.Provider>
      </Box>
    </ThemeProvider>
  );
}

export default App;