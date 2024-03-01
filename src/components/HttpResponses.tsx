import { Stack } from '@mui/material'
import * as React from 'react'
import { HttpResponseCard } from './HttpResponseCard'
import { TempUtils } from '../support/TempUtils';
import { useApplicationContext, HttpExchangeContext } from '../support/Context';
import { RcUtils } from '../support/RestClientUtils'

/**
 * This component is responsible for rendering the http responses via HttpResponseCard. It's basically a kind
 * of wrapper for all responses that controls the layout and positioning of the cards taking into account 
 * the drawer state and scrollbar visibility. When the drawer is open or the vertical scrollbar is visible,
 * the width of the responses section is set accordingly (with help from css calc). 
 * 
 * @returns HttpResponses component
 */
export const HttpResponses = () => {    
    const renderCounter = React.useRef(0)
    console.log(`<HttpResponses /> rendered ${++renderCounter.current} times`)

    const [responses, setResponses] = React.useState<React.ReactElement[]>([])
    const httpExchangeHolder = React.useContext(HttpExchangeContext)
    const appState = useApplicationContext()

    const deleteCallBack = (id: string) => { 
      // originally i was filtering on the responses state var but when this call back was called
      // the responses value was based on the state when the HttpResponseCard was created (I guess
      // it was closured) instead of the current state. So I had to change it to use the current 
      // state value.
      setResponses((currentResponses) => {
        const newResponses = currentResponses.filter((response) => response.key !== id)
        return newResponses
      })
    }

    if(httpExchangeHolder.value) {
      const id = httpExchangeHolder.value.id

      setResponses([
          <HttpResponseCard 
            key={id} 
            exchange={httpExchangeHolder.value} 
            deleteCallBack={deleteCallBack} />, 
          ...responses])
      httpExchangeHolder.value = undefined
    }
   
    /**
     * Start code supporting the drawer state and scrollbar visibility so we cant figure out the width of 
     * the responses section.
     */
    const [isScrollbarVisible, setIsScrollbarVisible] = React.useState(false);

    const checkIfScrollbarVisible = () => {
        const hasVerticalScrollbar = window.innerWidth > document.documentElement.clientWidth;
        setIsScrollbarVisible(hasVerticalScrollbar);
      };

      React.useEffect(() => {
        window.addEventListener('resize', checkIfScrollbarVisible);
        window.addEventListener('scroll', checkIfScrollbarVisible);
    
        return () => {
          window.removeEventListener('resize', checkIfScrollbarVisible);
          window.removeEventListener('scroll', checkIfScrollbarVisible);
        };
      }, []);//called only once when component mounts because **empty** dependency array.
      
      React.useEffect(() => {
        // adding/removing things from the dom can change scrollbar visibility w/out any resize/scroll event
        // so let's trigger a scroll event to ensure we have the correct isScrollbarVisible state and 
        // set the widthOffset accordingly.
        RcUtils.dispatchFantomScroll();
      });// called every time the component renders because **no** dependency array.


    let widthOffset = appState.isDrawerOpen ? appState.drawerWidth + 40 : 40
    widthOffset = isScrollbarVisible ? widthOffset + 15 : widthOffset

    return (
        <Stack rowGap={2.5} marginBottom={5}
            sx={{ padding: '0px', ml: '20px', mr: '20px', maxWidth: `calc(100vw - ${widthOffset}px)` }}>
            {responses}
        </Stack>
    )
}
