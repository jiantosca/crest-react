import * as React from 'react'
/**
 * Re-redners will happen when a context object changes so it's not going to be a good idea to have
 * a global context to hold everything. If certain values only need to cause rerender in certain 
 * componenents, then give thme their own state. 
 */

export interface DrawerState {
    isOpen: boolean
    isDarkMode: boolean
    width: number
    // can try methods later...
    toggleDarkMode: () => void | undefined
    toggleDrawer: () => void | undefined
}

export const DrawerContext = React.createContext<DrawerState | undefined>(undefined);

//custom useDrawerContext hook
export const useDrawerContext = () => {
    const drawer = React.useContext(DrawerContext)

    if(drawer === undefined) {
        throw new Error('useDrawerContext must be used with DrawerContext. ' + 
            'You\'re missing <DrawerContext.Provider> in your component, or one of it\'s parent components.')
    }

    return drawer
}