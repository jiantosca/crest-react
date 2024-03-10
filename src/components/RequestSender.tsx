import React from 'react'
import { Storage } from '../support/storage'
import SendIcon from '@mui/icons-material/Send'
import StopCircleIcon from '@mui/icons-material/StopCircle'
import { RcUtils } from '../support/rest-client-utils'
import { HttpExchangeHandler } from '../support/http-exchange-handler'
import { useApplicationContext, useHttpExchangeContext } from '../support/context'
import { HttpExchange, HttpRequest, NameValuePair } from '../support/type.http-exchange'
import { Stack, Typography, Alert, Button } from '@mui/material'


export const requestSentEventType = 'requestSentEvent'
export const requestCompleteEventType = 'requestCompleteEvent'

/**
 * I'm guessing this "outer" state (outside the component) var is a hack but for now it works. Managing the state for what I want 
 * to do with the send button was getting confusing and this works. Basically when the user clicks the button to submit a request
 * it should first be disabled, and if the request is taking longer than a second then it turns into a stop button, and finally 
 * once the request is finished it goes back to original send button. So basically 3 steps...
 * 
 * 1. When the user clicks the send button, the button will be disabled. We're using state (RequestSenderButtonStateType) for this
 *    on click.
 * 
 * 2. If the request is taking more than one second then the button should change to a stop button. This is handled via setTimeout
 *    function. The function checks outerState.requestInFlight, and if the request is still in flight then we'll give user the stop
 *    button via setRequestSenderState.
 * 
 * 3. Finally the exchangeCompletionHandler executes using setRequestSenderState to put it back to a send button.
 */
const outerState = {
  requestInFlight: false as boolean,
  // below only set when not running as extension since ext does everything in service worker
  inFlightHttpExchangeHandler: undefined as HttpExchangeHandler | undefined
}

/**
 * Holds the state for the send button. This is used to control the button's text, icon, color, and the 
 * function it calls when clicked which can change based on the state of the request. 
 */
type RequestSenderButtonStateType = {
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
 * 1. A new HttpExchange is created with the method, url, headers, and body from the input fields.
 * 2. Some validation is done to ensure the url is valid and the headers are valid. If invalid, a dialog
 *    lets the user know what's wrong.
 * 3. An HttpRequest is created and an HttpExchangeHandler is contructedwith it. Then  
 *    HttpExchangeHandler.submitRequest is called with a callback to  handle the response. When 
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
export const RequestSender = (
  { method, urlRef, headersRef, bodyRef }: {
    method: string,
    urlRef: React.MutableRefObject<string>,
    headersRef: React.MutableRefObject<string>,
    bodyRef: React.MutableRefObject<string>
  }) => {

  const renderCounter = React.useRef(0)
  // note this comp will render twice when someone updates the method in the parent RequestBuilder come. Once
  // because the method state changes, and again because parent comp has a useEffect that changes the bodyDisplay 
  // state based on the method state. No biggie, just noting it.
  console.log(`<RequestSender /> rendered ${++renderCounter.current} times`)

  const { setHttpExchangeHolder } = useHttpExchangeContext()
  const appContext = useApplicationContext()

  const sendClickCallback = (event?: React.MouseEvent<HTMLButtonElement>) => {

    const headerLines = headersRef.current.trim().split('\n')
      .filter(header => header.trim() !== '')

    const problems: string[] = []

    if (urlRef.current.trim() === '' || !urlRef.current.startsWith('http')) {
      problems.push('Enter a valid URL that starts with http or https')
    }

    const headerNameValues: NameValuePair[] = (headerLines.length > 0) ?
      headerLines.map(header => {
        const [name, ...value] = header.split(':');
        if (value.length === 0) {
          problems.push(`"${name}" doesn't appear to be a valid header`)
        }
        return { name: name, value: value.join(':').trim() } as NameValuePair
      }) : []

    if (problems.length > 0) {
      const problemListItems = problems.map(problem => <Alert severity="error"><Typography>{problem}</Typography></Alert>)
      appContext.showDialog('Invalid Request', <Stack sx={{ width: '100%', pt: 1 }} spacing={2}>{problemListItems}</Stack>)
      return
    }
    const guid = RcUtils.generateGUID()

    const httpRequest: HttpRequest = {
      id: guid,
      method: method,
      url: urlRef.current,
      headers: headerNameValues,
      body: (bodyRef.current.trim()) ? bodyRef.current.trim() : undefined
    }

    /**
     * Call back to abort the request when the user clicks the stop button. When a request 
     * is aborted the completion handler (below) will be called which has some logic to 
     * avoid painting any kind of response.
     */
    const abortRequest = () => {
      console.log('<RequestSender />.abortRequest')
      outerState.requestInFlight = false
      if (RcUtils.isExtensionRuntime()) {
        chrome.runtime.sendMessage({ abortId: guid })
      } else {
        outerState.inFlightHttpExchangeHandler?.abort()
      }
    }

    /**
     * Call back to handle the response. This is called when the response is received.
     * 
     * @param httpExchange 
     * @returns 
     */
    const exchangeCompletionHandler = (httpExchange: HttpExchange) => {
      console.log('<RequestSender />.exchangeCompletionHandler', httpExchange)

      document.dispatchEvent(new Event(requestCompleteEventType))

      outerState.requestInFlight = false
      outerState.inFlightHttpExchangeHandler = undefined

      setRequestSenderState({
        text: 'Send',
        icon: <SendIcon />,
        color: 'primary',
        disabled: false,
        onClick: sendClickCallback
      })

      if (!RcUtils.isExtensionRuntime()) {
        httpExchange.response.headers.push({ name: 'headers-suppressed', value: 'because not running as extension (see fetch & Access-Control-Expose-Headers)' })
      }

      if (httpExchange.response.statusCode === 0) {
        if (httpExchange.aborted) {
          return
        } else if (httpExchange.timedout) {
          appContext.showDialog('Timed Out',
            <Alert severity="warning">
              <Typography component="div">The request timed out after {httpExchange.timeout} milliseconds.</Typography>
            </Alert>)
        } else {
          appContext.showDialog('Network Error',
            <Alert severity="error">
              {/* component='div' so each typography is on a new line */}
              <Typography component="div">No response from the server. Ensure your URL is correct.</Typography>
              {httpExchange.request.url.startsWith('https') && <Typography component="div" pt={1}>This could also be due to SSL issues. You could add an exception in chrome if appropriate.</Typography>}
            </Alert>)
        }
        return
      }

      if (httpExchange.response.statusCode < 300) {
        Storage.storeUrl(httpRequest.url)
        Storage.storeHeaders(headerLines)
      }
      // below causes rerender in the parent RequestBuilder because it's inside of the HttpExchangeContext.Provider (App.tsx)
      // but no biggie. main thing is we need this comp, and the HttpResponses inside of the HttpExchangeContext.Provider
      // so we can render responses via setting the httpExchangeHolder holder below.
      setHttpExchangeHolder({ value: httpExchange })
    }

    outerState.requestInFlight = true

    setRequestSenderState((state) => ({ ...state, disabled: true }))
    setTimeout(() => {
      if (outerState.requestInFlight) {
        setRequestSenderState(({
          text: 'Stop',
          icon: <StopCircleIcon />,
          color: 'warning',
          disabled: false,
          onClick: abortRequest
        }))
      }
    }, 1000);

    document.dispatchEvent(new Event(requestSentEventType))

    if (RcUtils.isExtensionRuntime()) {
      console.log('<RequestSender />.sendClickCallback running as extension')
      chrome.runtime.sendMessage(httpRequest, exchangeCompletionHandler);
    } else {
      console.log('<RequestSender />.sendClickCallback not running as extension')
      const httpExchangeHandler = new HttpExchangeHandler(httpRequest)
      outerState.inFlightHttpExchangeHandler = httpExchangeHandler
      httpExchangeHandler.submitRequest(exchangeCompletionHandler)
    }
  }

  const [requestSenderState, setRequestSenderState] = React.useState<RequestSenderButtonStateType>({
    text: 'Send',
    icon: <SendIcon />,
    color: 'primary',
    disabled: false,
    onClick: sendClickCallback,
  })

  return (
    //how i figure out alignment via flex https://www.youtube.com/watch?v=sKeW8r_mDS0
    <Stack direction='row'
      sx={{ display: 'flex', border: 0 }}
      justifyContent='flex-end'
      alignItems='flex-end'
    >
      <Button
        variant='contained'
        disabled={requestSenderState.disabled}
        color={requestSenderState.color}
        //size={RcUtils.defaultSize}
        // size='small'
        endIcon={requestSenderState.icon}
        onClick={requestSenderState.onClick}
      >
        {requestSenderState.text}
      </Button>
    </Stack>
  )
}
