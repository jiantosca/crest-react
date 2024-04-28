import { Stack, Typography } from '@mui/material'
import * as React from 'react'
import { HttpResponseCard } from './HttpResponseCard'
import { useApplicationContext, useHttpExchangeContext } from '../support/react-contexts';
import { useScrollbarVisibleForWindow } from '../support/scrollbar-hooks';
import { RcUtils } from '../support/rest-client-utils';
/**
 * This component is responsible for rendering the http responses via HttpResponseCard. It's basically a kind
 * of wrapper for all responses.
 * 
 * After a week I forgot the intracacies of how this component knows when to render a new response so will 
 * try to elaborate. 
 *  - App.tsx is the component that renders this component as well as the request buider component from which
 *    new requests are made and hence should cause this coponent to render a response. 
 *  - The App.tsx component has a state variable called httpExchangeHolder which is just a wrapper/holder for
 *    a HttpExchange object. This holder is exposed to this component as well as the request builder through
 *    the use of the HttpExchangeContext. The provider is setup in App.tsx since it's the parent of both this
 *    and the request builder component.
 *  - When a new request is submitted in the request builder component, it updates the httpExchangeHolder with a
 *    new http exchange object causing App.tsx to re-render and that causes this component to re-render as well 
 *    since it's a child component. 
 *  - When this component renders/re-renders, it checks the httpExchangeHolder for a value and if it finds
 *    one (which it will if someone just submitted a request), it creates a new HttpResponseCard component and 
 *    adds it to the responses state variable (an array of HttpResponseCards) causing this component to re-render 
 *    with the new HttpResponseCard. Interestingly, react is smart enough not to re-render the any existing 
 *    HttpResponseCards in the responses state variable.
 *  - This component also sets the value in the httpExchangeHolder to undefined so that it doesn't keep creating
 *    new HttpResponseCard components every time it renders.
 *  
 * 
 * @returns HttpResponses component
 */
export const HttpResponses = () => {    
    const renderCounter = React.useRef(0)
    console.log(`<HttpResponses /> rendered ${++renderCounter.current} times`)

    const [responses, setResponses] = React.useState<React.ReactElement[]>([])
    const {httpExchangeHolder} = useHttpExchangeContext()
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
      const id = httpExchangeHolder.value.request.id
      const newExchange = httpExchangeHolder.value

      console.log('<HttpResponses - setting httpExchangeHolder.value to undefined>')
      httpExchangeHolder.value = undefined //prevent an inifinate loop!

      setResponses([
          <HttpResponseCard 
            key={id} 
            exchange={newExchange} 
            deleteCallBack={deleteCallBack} />, 
          ...responses])
    }
   
    /**
     * So width offet can get a little weird. We need to include the drawer width which is simple enough, but things get odd when trying to 
     * consider the vertical scroll bar which isn't so straight forward. When we have enough responses we'll have a vertical scrollbar adds
     * 15px worth of padding **in some cases** which is frustrating as heck. So some responses have extra wide data which will cause the 
     * response to be wider than don't exceed the viewable area. In this case we need to add the 15 px extra offset. Now even when the response
     * is small and doesn't exceed the viewable area we can still add the 15px offset w/out any negative impact even though it's not needed. So
     * best just to always add it when we know scrollbar is visible. 
     * 
     * NOTE: I sure hope windows doesn't have a different scrollbar width than mac.
     * 
     * TODO: There must be a better way to force the response card to fit within the viewable area without having to worry about the scrollbar
     * and calculating the width offset using stuff like "maxWidth: `calc(100vw - ${widthOffset}px)` }}"
     */

    //let widthOffset = appState.isDrawerOpen ? appState.drawerWidth + 55 : 55
    const isScrollbarVisible = useScrollbarVisibleForWindow(renderCounter.current)

    //let's just be explicit here. First define the numbers we need...
    const margin = 20
    const marginOffset = margin * 2
    const scrollbarOffset = isScrollbarVisible ? 15 : 0

    const offset = appState.isDrawerOpen ? 
            marginOffset + scrollbarOffset + appState.drawerWidth
            : 
            marginOffset + scrollbarOffset

    return (
        <Stack rowGap={2.5} marginBottom={5}
            sx={{ padding: '0px', ml: `${margin}px`, mr: `${margin}px`, maxWidth: `calc(100vw - ${offset}px)` }}>
            {/* <MyAutoComplete />
            <MyAutoComplete3 /> */}
            {responses}
            <Typography pl={2} variant='caption' color='gray'>
              {RcUtils.isExtensionRuntime() ? `v${chrome.runtime.getManifest().version}` : 'v.local.server'}
            </Typography>
        </Stack>
    )
}
