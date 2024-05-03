import './App.css';
import * as React from 'react';
//import useMediaQuery from '@mui/material/useMediaQuery';
import { Breakpoint, ThemeProvider, createTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { RequestBuilder } from './components/RequestBuilder'
import { ApplicationContext, Application, HttpExchangeContext, HttpExchangeHolder } from './support/react-contexts';
import { AppDrawer } from './components/AppDrawer';
// import { AppDrawer } from './components/AppDrawer2';
//import { AppDrawer } from './components/AppDrawerOrig';

import { HttpResponses } from './components/HttpResponses';
import { DevNotes } from './components/DevNotes';
import { AppDialog, AppDialogStateType, closedAppDialogState, appDialogEventName } from './components/AppDialog';
//import { setupTestData } from './support/temp-data-setup';
import { AppSettings } from './support/settings';

const devMode = window.location.href.includes('installType=development') || window.location.href.startsWith('http');

const drawerWidth = 300
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

  const [httpExchangeHolder, setHttpExchangeHolder] = React.useState<HttpExchangeHolder>({value:undefined})
  
  const [appState, setAppState] = React.useState<Application>({
    isDrawerOpen: AppSettings.isDrawerOpen(),
    isDarkMode: AppSettings.isDarkMode(),
    drawerWidth: drawerWidth,
    toggleDrawer: () => {
      appState.isDrawerOpen = AppSettings.toggleDrawer()
      setAppState({ ...appState })
    },
    toggleDarkMode: () => {
      appState.isDarkMode = AppSettings.toggleDarkMode()
      setAppState({ ...appState })
    },
    showDialog: (title: string, content: React.ReactElement, maxWidth?: Breakpoint | false ) => {

      const dialogState: AppDialogStateType = { 
        isOpen: true,
        dividers: false,
        title: title,
        maxWidth: maxWidth !== undefined ? maxWidth : 'sm',
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
    typography: {
      fontSize: 13.25, // default is 14
    },    
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

  React.useEffect(() => {
    //other tabs can update settings that impact the ui...  When 'settings' is written to storage, an event will be triggered
    //in all tabs of the ext except for the one originating the event. By setting appState wel'll trigger a rerender of the ui
    // updating drawer and dark mode if need be, as well as rerendering the settings section in the drawer keeping it's values
    // in sync across all tabs.
    const syncUiWithSettings = (e: StorageEvent) => {
      const settings = AppSettings.get()
      if( e.key === 'settings') {
            setAppState({ ...appState, 
              isDrawerOpen: settings.isDrawerOpen,
              isDarkMode: settings.isDarkMode})
      }
    }
    window.addEventListener('storage', syncUiWithSettings)
    return () => {
      window.removeEventListener('storage', syncUiWithSettings)
    }
  }, [appState])

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


