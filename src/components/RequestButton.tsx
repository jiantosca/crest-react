import React from 'react'
import { Storage } from '../support/storage'
import SendIcon from '@mui/icons-material/Send'
import StopCircleIcon from '@mui/icons-material/StopCircle'
import { RcUtils } from '../support/rest-client-utils'
import { HttpExchangeHandler } from '../support/http-exchange'
import { useApplicationContext, useHttpExchangeContext } from '../support/react-contexts'
import { HttpExchange, HttpRequest, NameValuePair } from '../support/http-exchange'
import { Stack, Typography, Alert, Button } from '@mui/material'
import { HeaderHelper } from '../support/header-helper'
import { handleCrestRequest } from '../support/crest-endpoints'

export const requestSentEventType = 'requestSentEvent'
export const requestCompleteEventType = 'requestCompleteEvent'

/**
 * I'm guessing this "outer" state (outside the component) var is kind of a hack but for now it works. Managing the state for what I 
 * want  to do with the send button was getting confusing with react. Basically when the user clicks the button to submit a request
 * it should first be disabled, and if the request is taking longer than a second then it turns into a stop button, and finally 
 * once the request is finished it goes back to original send button. So basically 3 steps...
 * 
 * 1. When the user clicks the send button, the button will be disabled. We're using state (RequestButtonStateType) for this
 *    on click.
 * 
 * 2. If the request is taking more than one second then the button should change to a stop button. This is handled via setTimeout
 *    function (after 1 second). The function checks outerState.requestInFlight, and if the request is still in flight then we'll 
 *    give user the stop button via setRequestButtonState. Now the user has the option to stop the request. Clicking it will invoke 
 *    the abortRequest function which will either call the background service worker to stop the requestion (when running as an extension) 
 *    or it will use the outsState inFlightHttpExchangeHandler and inFlightHeaderHeaper vars to stop the request. inFlightHeaderHeaper 
 *    might be doing oauth calls we need to stop, and inFlightHttpExchangeHandler is the main request we need to stop.
 * 
 * 3. Finally the exchangeCompletionHandler executes using setRequestButtonState to put it back to a send button.
 */
const outerState = {
  requestInFlight: false as boolean,
  inFlightHeaderHelper: undefined as HeaderHelper | undefined,
  inFlightHttpExchangeHandler: undefined as HttpExchangeHandler | undefined,

  reset: () => {
    outerState.requestInFlight = false
    outerState.inFlightHeaderHelper = undefined
    outerState.inFlightHttpExchangeHandler = undefined
  }
}

/**
 * Holds the state for the send button. This is used to control the button's text, icon, color, and the 
 * function it calls when clicked which can change based on the state of the request. 
 */
type RequestButtonStateType = {
  text: string
  icon: React.ReactNode
  color: 'primary' | 'warning'
  disabled: boolean
  onClick: (event?: React.MouseEvent<HTMLButtonElement>) => void
}

/**
 * This component provides a button to send the http request as well as the code to trigger the
 * response handling.
 * 
 * When the send button is clicked, the following happens:
 * 
 * 1. A new HttpExchange is created with the method, url, headers, and body from the input fields of the
 *    parent RequestBuilder component.
 * 2. Some validation is done to ensure the url is valid and the headers are valid. If invalid, a dialog
 *    lets the user know what's wrong.
 * 3. An HttpRequest is created and an HttpExchangeHandler is contructed with it. Then  
 *    HttpExchangeHandler.submitRequest is called with a callback to handle the response. When 
 *    this code is running as an extention, the HttpRequest is actually passed to the background 
 *    service worker which deals with the  HttpExchangeHandler. Either  way, the HttpExchangeHandler.submitRequest 
 *    method will send the request and call the callback method when a response is received with an HttpExchange
 *    object container all the data needed on the http request/response. 
 * 4. The callback method will store the url and headers (if http 2xx status) in storage for auto 
 *    complete suggestions in the future.
 * 5. Then the callback method will set the httpExchangeHolder through the use of the useHttpExchangeContext
 *    custom hook which triggers rendering of the HttpResponses compoent that will include the new response.
 *    More details on how this works in the HttpResponses component.
 */
export const RequestButton = (
  { methodRef, urlRef, headersRef, bodyRef }: {
    methodRef: React.MutableRefObject<string>,
    urlRef: React.MutableRefObject<string>,
    headersRef: React.MutableRefObject<string>,
    bodyRef: React.MutableRefObject<string>
  }) => {

  const renderCounter = React.useRef(0)
  // note this comp will render twice when someone updates the method in the parent RequestBuilder. Once
  // because the method state changes, and again because parent comp has a useEffect that changes the bodyDisplay 
  // state based on the method state. No biggie, just noting it.
  console.log(`<RequestButton /> rendered ${++renderCounter.current} times`)

  const { setHttpExchangeHolder } = useHttpExchangeContext()
  const appContext = useApplicationContext()

  /**
   * This is the main function that is called when the user clicks the send button. It will first setup a couple
   * call back functions used to abort requests, and handled completed requests (aka responses :). Then it has code
   * to submit the request which uses the afrormentioned call back functions.
   */
  const sendClickCallback = async (event?: React.MouseEvent<HTMLButtonElement>) => {

    /**
     * Call back to abort the request when the user clicks the stop button. When a request 
     * is aborted the completion handler (below) will be called which has some logic to 
     * avoid painting any kind of response.
     */
    const abortRequest = () => {
      console.log('<RequestButton />.abortRequest')
      outerState.requestInFlight = false
      if (RcUtils.isExtensionRuntime()) {
        chrome.runtime.sendMessage({ abortId: guid })
      } else {
        //header helper can have an in flight http request to get the token
        outerState.inFlightHeaderHelper?.getHttpExchangeHandler()?.abort()
        //this is the main request
        outerState.inFlightHttpExchangeHandler?.abort()
      }
    }
    // end abortRequest

    const resetUI = () => {
      document.dispatchEvent(new Event(requestCompleteEventType))
      outerState.reset()
      setRequestButtonState(sendRequestButtonState)
    }

    /**
     * Call back to handle the response. This is called when the response is received.
     * 
     * @param httpExchange 
     * @returns 
     */
    const exchangeCompletionHandler = (httpExchange: HttpExchange) => {
      console.log('<RequestButton />.exchangeCompletionHandler', httpExchange)

      resetUI()

      if (!RcUtils.isExtensionRuntime()) {
        httpExchange.response.headers.push({ name: 'headers-suppressed', value: 'because not running as extension (see fetch & Access-Control-Expose-Headers)' })
      }

      if (httpExchange.response.statusCode === 0) {
        RcUtils.showNoStatusCodeDialog(httpExchange, appContext)
        return
      }
      
      httpExchange.request.isOAuth = RcUtils.isOauth(httpExchange.response)

      if (httpExchange.response.statusCode < 300) {
        Storage.storeUrl(httpRequest.url)
        Storage.storeHeaders(headerLines)
        Storage.updateRequestHistory(httpExchange.request)
      }
      // below causes rerender in the parent RequestBuilder because it's inside of the HttpExchangeContext.Provider (App.tsx)
      // but no biggie. main thing is we need this comp, and the HttpResponses inside of the HttpExchangeContext.Provider
      // so we can render responses via setting the httpExchangeHolder holder below.
      setHttpExchangeHolder({ value: httpExchange })
    }
    // end exchangeCompletionHandler

    /**
     * now that we have some callbacks, let's validate the input and send the request. 
     */ 
    const problems: string[] = []

    if (!urlRef.current.startsWith('http://') &&
        !urlRef.current.startsWith('https://') && 
        !urlRef.current.startsWith('crest://')) {
      problems.push('Enter a valid URL that starts with http:// or https://')
    }

    const headerLines = headersRef.current.trim().split('\n').filter(header => header.trim() !== '')

    const headerNameValues: NameValuePair[] = (headerLines.length > 0) ?
      headerLines.map(header => {
        const nameValue = RcUtils.parseHeaderLine(header)
        if( !nameValue.name || !nameValue.value) {
          problems.push(`Invalid header '${header}'`)
        }
        return nameValue
      }) : []

    if (problems.length > 0) {
      const problemListItems = problems.map((problem, index) => <Alert key={index} severity="error"><Typography>{problem}</Typography></Alert>)
      appContext.showDialog('Invalid Request', <Stack sx={{ width: '100%', pt: 1 }} spacing={2}>{problemListItems}</Stack>)
      return
    }

    outerState.requestInFlight = true
    setRequestButtonState({ ...sendRequestButtonState, disabled: true })
    document.dispatchEvent(new Event(requestSentEventType))//progress bar listens for this

    setTimeout(() => {
      if (outerState.requestInFlight) {
        setRequestButtonState(({
          text: 'Stop',
          icon: <StopCircleIcon />,
          color: 'warning',
          disabled: false,
          onClick: abortRequest
        }))
      }
    }, 1000);

    // guid really used for stopping requests when running as an extension. Header helper is using the same 
    // guid as the main http request since in case of header with oauth, this could result in it's own http
    // request to fetch the token and we want to be ablle to stop that too if the user clicks the stop button.
    const guid = RcUtils.generateGUID()
    
    const headerHelper = new HeaderHelper(headerNameValues, guid, appContext.showDialog)
    outerState.inFlightHeaderHelper = headerHelper
    let resolvedHeaders;
    try {
      resolvedHeaders = await headerHelper.resolveHeaders()
    } catch (error) {
      console.log('Header helper was either aborted, or if there was a real issue it should have already triggered ' +
        'a dialog for the user to review the issue. Error: ', error)
      resetUI()
      return;
    }

    const httpRequest: HttpRequest = {
      id: guid,
      //name: `${methodRef.current} ${urlRef.current} ${guid}`,
      name: '',
      timestamp: new Date().getTime(),
      method: methodRef.current,
      url: urlRef.current,
      headers: resolvedHeaders,
      unresolvedHeaders: headerNameValues,
      body: (['POST', 'PUT'].includes(methodRef.current) && bodyRef.current.trim()) ? 
        bodyRef.current.trim() : undefined
    }
    
    if(urlRef.current.startsWith('crest://')) {
      const exchange = handleCrestRequest(httpRequest)
      exchangeCompletionHandler(exchange)
      return
    }

    if (RcUtils.isExtensionRuntime()) {
      console.log('<RequestButton />.sendClickCallback running as extension')
      chrome.runtime.sendMessage(httpRequest, exchangeCompletionHandler);
    } else {
      console.log('<RequestButton />.sendClickCallback not running as extension')
      const httpExchangeHandler = new HttpExchangeHandler(httpRequest)
      outerState.inFlightHttpExchangeHandler = httpExchangeHandler
      httpExchangeHandler.submitRequest().then(exchangeCompletionHandler)
    }
  }

  const sendRequestButtonState: RequestButtonStateType = {
    text: 'Send',
    icon: <SendIcon />,
    color: 'primary',
    disabled: false,
    onClick: sendClickCallback,
  }

  const [requestButtonState, setRequestButtonState] = React.useState<RequestButtonStateType>(sendRequestButtonState)


  return (
    //how i figure out alignment via flex https://www.youtube.com/watch?v=sKeW8r_mDS0
    <Stack direction='row'
      sx={{ display: 'flex', border: 0 }}
      justifyContent='flex-end'
      alignItems='flex-end'
    >
      <Button
        variant='contained'
        disabled={requestButtonState.disabled}
        color={requestButtonState.color}
        //size={RcUtils.defaultSize}
        size='small'
        endIcon={requestButtonState.icon}
        onClick={requestButtonState.onClick}
      >
        {requestButtonState.text}
      </Button>
    </Stack>
  )
}
