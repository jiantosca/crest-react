import * as React from 'react'
import { HttpExchange } from './RestClientUtils'


//maybe i should rename this to UiContext or AppUiContext
export interface Application {
    isDrawerOpen: boolean
    isDarkMode: boolean
    drawerWidth: number
    toggleDarkMode: () => void
    toggleDrawer: () => void
    setHttpExchangeHolder: (exchange: HttpExchangeHolder) => void
    // setHttpExchange: (exchange: HttpExchange) => void | undefined
    // setAppState: (appState: Application) => void | undefined
}
export const ApplicationContext = React.createContext<Application | undefined>(undefined);
export const useApplicationContext = () => {
    const app = React.useContext(ApplicationContext)

    if(app === undefined) {
        throw new Error('useApplicationContext must be used with ApplicationContext. ' + 
            'You\'re missing <ApplicationContext.Provider> in one of your components that sets it up.')
    }

    return app
}


export interface HttpExchangeHolder {
    value: HttpExchange | undefined
}

export const HttpExchangeContext = React.createContext<HttpExchangeHolder>({value: undefined});

// export const useCurrentHttpExchangeContext = () => {
//     const http = React.useContext(CurrentHttpExchangeContext)

//     if(http === undefined) {
//         throw new Error('useHttpExchangeContext must be used with CurrentHttpExchangeContext. ' + 
//             'You\'re missing <HttpExchangeContext.Provider> in one of your components that sets it up.')
//     }

//     return http
// }