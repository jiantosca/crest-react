import { Stack } from '@mui/material'
import * as React from 'react'
import { HttpResponseCard } from './HttpResponseCard'
import { TempUtils } from '../support/TempUtils';
import { useDrawerContext } from '../support/Context';

/**
 * This component is responsible for rendering the http responses via HttpResponseCard. It's basically a kind
 * of wrapper for all responses that controls the layout and positioning of the cards taking into account 
 * the drawer state and scrollbar visibility.
 * 
 * @returns HttpResponses component
 */
export const HttpResponses = () => {    
    const renderCounter = React.useRef(0)
    console.log(`<HttpResponses /> rendered ${++renderCounter.current} times`)

    const [isScrollbarVisible, setIsScrollbarVisible] = React.useState(false);

    const checkIfScrollbarVisible = () => {
        const hasVerticalScrollbar = window.innerWidth > document.documentElement.clientWidth;
        setIsScrollbarVisible(hasVerticalScrollbar);
      };
      React.useEffect(() => {
        checkIfScrollbarVisible();
        window.addEventListener('resize', checkIfScrollbarVisible);
        window.addEventListener('scroll', checkIfScrollbarVisible);
    
        return () => {
          window.removeEventListener('resize', checkIfScrollbarVisible);
          window.removeEventListener('scroll', checkIfScrollbarVisible);
        };
      }, []);

    const drawerState = useDrawerContext()

    let widthOffset = drawerState.isOpen ? drawerState.width + 40 : 40
    widthOffset = isScrollbarVisible ? widthOffset + 15 : widthOffset

    return (
        <Stack rowGap={2.5} marginBottom={5}
            sx={{ padding: '0px', ml: '20px', mr: '20px', maxWidth: `calc(100vw - ${widthOffset}px)` }}>
            <HttpResponseCard exchange={TempUtils.httpExchangeContext1} />
            <HttpResponseCard exchange={TempUtils.httpExchangeContext2} />
        </Stack>
    )
}
