import './App.css';
import * as React from 'react';
//import useMediaQuery from '@mui/material/useMediaQuery';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { RequestBuilder } from './components/RequestBuilder'
import { ApplicationContext, Application, HttpExchangeContext, HttpExchangeHolder } from './support/react-contexts';
import { AppDrawer } from './components/AppDrawer';
import { HttpResponses } from './components/HttpResponses';
import { DevNotes } from './components/DevNotes';
import { AppDialog, AppDialogStateType, closedAppDialogState, appDialogEventName } from './components/AppDialog';
import { setupTestData } from './support/temp-data-setup';

const devMode = window.location.href.includes('installType=development') || window.location.href.startsWith('http');

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

  const [httpExchangeHolder, setHttpExchangeHolder] = React.useState<HttpExchangeHolder>({value:undefined})
  
  const [appState, setAppState] = React.useState<Application>({
    isDrawerOpen: false,
    isDarkMode: true,//pull from local storage or just stick with 
    drawerWidth: drawerWidth,
    toggleDrawer: () => {
      appState.isDrawerOpen = !appState.isDrawerOpen
      setAppState({ ...appState })
    },
    toggleDarkMode: () => {
      appState.isDarkMode = !appState.isDarkMode
      setAppState({ ...appState })
    },
    showDialog: (title: string, content: React.ReactElement) => {
      const dialogState: AppDialogStateType = { 
        isOpen: true,
        dividers: false,
        title: title,
        content: content
      }
      const event = new CustomEvent(appDialogEventName, {detail: dialogState});
      document.dispatchEvent(event);
      console.log('showDialog')
    }, 
    hideDialog: () => {
      const event = new CustomEvent(appDialogEventName, {detail: closedAppDialogState});
      document.dispatchEvent(event);
      console.log('closeDialog')
    }
  });

  const appTheme = createTheme({
    palette: {
      mode: appState.isDarkMode ? 'dark' : 'light',
    },
    transitions: {
      duration: {
        leavingScreen: 0,
        enteringScreen: 0
      }
    }
  });

  React.useEffect(()=> {
    console.log('<App /> - init stuff goes in here when needed.')
    setupTestData()
  }, [])

  return (
    
    <ThemeProvider theme={appTheme}>
      <Box sx={{ display: 'flex' }}>
      {/* enableColorScheme is how i got scroll bar color to match theme, for some reason every all the other
      components are using the correct color scheme, but the scroll bar is not. */}
        <CssBaseline enableColorScheme/>
        <ApplicationContext.Provider value={appState}>
          <AppDrawer />
          <Main open={appState.isDrawerOpen} sx={{ p: 0, border: '0px solid black' }}>
              <HttpExchangeContext.Provider value={{httpExchangeHolder, setHttpExchangeHolder}}>
                <RequestBuilder />
                <HttpResponses />
              </HttpExchangeContext.Provider>
              {devMode && <DevNotes />}
          </Main>
          <AppDialog />
        </ApplicationContext.Provider>
      </Box>
    </ThemeProvider>
  );
}

export default App;


