import * as React from 'react'
import { HttpExchange } from './http-exchange'
import { Breakpoint } from '@mui/material'


//maybe i should rename this to UiContext or AppUiContext
export type Application = {
    isDrawerOpen: boolean
    isDarkMode: boolean
    drawerWidth: number
    toggleDarkMode: () => void
    toggleDrawer: () => void
    showDialog: (title: string, children: React.ReactElement, maxWidth?: Breakpoint | false ) => void
    hideDialog: () => void
}
export const ApplicationContext = React.createContext<Application | undefined>(undefined);
export const useApplicationContext = () => {
    const context = React.useContext(ApplicationContext)

    if(context === undefined) {
        throw new Error('useApplicationContext must be used with ApplicationContext. ' + 
            'You\'re missing <ApplicationContext.Provider> in one of your components that sets it up.')
    }

    return context
}


export type HttpExchangeHolder = {
    value: HttpExchange | undefined
}
export type HttpExchangeContextType = {
    httpExchangeHolder: HttpExchangeHolder
    setHttpExchangeHolder: React.Dispatch<React.SetStateAction<HttpExchangeHolder>>;
}
export const HttpExchangeContext = React.createContext<HttpExchangeContextType|undefined>(undefined);

export const useHttpExchangeContext = () => {
    const context = React.useContext(HttpExchangeContext)

    if(context === undefined) {
        throw new Error('useHttpExchangeContext must be used with HttpExchangeContext. ' + 
            'You\'re missing <HttpExchangeContext.Provider> in one of your components that sets it up.')
    }

    return context
}