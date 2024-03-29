import * as React from 'react'
import { RcUtils } from '../support/rest-client-utils'
import {
  Paper, Stack, InputLabel, MenuItem, Select, FormControl,
  TextField, IconButton, Box, LinearProgress
}
  from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { useApplicationContext } from '../support/react-contexts'
import { RequestHeaderAutocomplete } from './RequestHeaderAutocomplete'
import { RequestButton, requestSentEventType, requestCompleteEventType } from './RequestButton'
import { HttpRequest, HttpRequestBundle } from '../support/http-exchange'
import { UrlAutoComplete } from './RequestUrlAutocomplete'

export const loadBundleEventType = 'loadBundle'

/**
 * 
 * The RequestionBuilder is mostly composed of other components to help build http requests. Here's the
 * components:
 * 
 * 1. BurgerMenu - a hamburger menu icon that when clicked toggles the drawer open/closed.
 * 2. MethodDropDown - a dropdown to select the http method (GET, POST, PUT, DELETE, etc).
 * 3. UrlAutoComplete - an autocomplete component for the url input.
 * 4. RequestSender - a button to send the http request as well as the code to trigger the
 *    response handling.
 * 5. RequestHeaderAutocomplete - an autocomplete component for the headers input.
 * 6. BodyInput - a text area for the body input.
 * 7. ProgressBar - a progress bar that shows when a request is sent and hides when the response is received.
 * 
 * RequestSender and RequestHeaderAutocomplete comps are in different files due to their complexity, but 
 * the rest of the components are in this file.
 */
export const RequestBuilder = () => {
  const renderCounter = React.useRef(0)
  renderCounter.current++
  console.log(`<RequestBuilder /> rendered ${renderCounter.current} times`)

  const [bodyDisplay, setBodyDisplay] = React.useState<string>('none')
  const [method, setMethod] = React.useState<string>('GET')
  React.useEffect(() => {
    ['POST', 'PUT'].includes(method) ? setBodyDisplay('') : setBodyDisplay('none')
    methodRef.current = method
  }, [method])

  //const urlRef = React.useRef<string>('http://localhost:8080/crest-api/test?mock=json.json&sleep=1000')
  const urlRef = React.useRef<string>('')
  const headersRef = React.useRef<string>('')
  const bodyRef = React.useRef<string>('')
  // was passing 'method' state var to RequestButton but even on a rerender the RequestButton
  // wasn't updating with latest state method value. So using a ref instead which works but sure
  // seems like if this comp rerenders with updated method which then causes RequestButton to rerender
  // it should be getting the latest method value. More for me to learn i guess!
  const methodRef = React.useRef<string>(method)


  // Below are refs to keys used for the UrlAutoComplete, RequestHeaderAutocomplete and BodyInput components. We need to be able to control 
  // when a component is rerendered vs created brand new. By setting unique key we can force a new comp instead of a rerender. This is 
  // required for loading bundles which happens on an event. The refs are updated in the useEffect below using a guid to force new comp.  
  // Otherwise during nrormal use the key will be the same and the comp will only rerender. 
  //
  // This is needed mostly because the auto completes that don't state being programatically updated after it's first render. So ensuring
  // a new comp is created instead of a rerender we get around the issue. This only happens on the bundle load event. 
  //
  // Here's the react MUI error: 
  //  MUI: A component is changing the default value state of an uncontrolled Autocomplete after being initialized.
  const urlKeyRef = React.useRef<string>('urlKey')
  const headerKeyRef = React.useRef<string>('headerKey')
  const bodyKeyRef = React.useRef<string>('bodyKey')
  
  const appContext = useApplicationContext()

  // we never use the forcedRender state var, but we need to set it to force a rerender
  // eslint-disable-next-line
  const [forcedRender, setForcedRender] = React.useState<number>(0)

  React.useEffect(() => {
    const bundleLoader: EventListener = (event) => {

      // only make unique on bundle load event, this'll force new comp creation instead of rerender needed for auto completes
      // and even body input so helper text moves out of the way.
      urlKeyRef.current = `urlKey-${RcUtils.generateGUID()}`
      headerKeyRef.current = `headerKey-${RcUtils.generateGUID()}`
      bodyKeyRef.current = `bodyKey-${RcUtils.generateGUID()}`

      const bundle = (event as CustomEvent<any>).detail as HttpRequestBundle | HttpRequest
      urlRef.current = (bundle.url) ? bundle.url : ''
      headersRef.current = bundle.headers?.map(header => `${header.name}: ${header.value}`).join('\n') || ''
      bodyRef.current = bundle.body || ''

      //now we need to set the method and ensure we rerender. If the bundle has a different method than the current value then we'll get
      //a rerender by setting method state, otherise we use the forcedRender state var to cause a rerender.
      const theMethod = bundle.method || 'GET'

      window.scrollTo(0, 0)
      
      if(theMethod !== method) {
        setMethod(theMethod)
      } else {
        setForcedRender(prev => prev + 1)
      }
    }

    document.addEventListener(loadBundleEventType, bundleLoader)
    // Cleanup function to remove the event listener when the component unmounts
    return () => {
      document.removeEventListener(loadBundleEventType, bundleLoader)
    }
  }, [method]);

  return (
    <Paper
      elevation={RcUtils.defaultElevation}
      //4 seems to be default radius, hate to manually set here but need to remove top radius.
      sx={{ borderRadius: '0px 0px 4px 4px', padding: '20px 20px 0px 20px', margin: '0px 20px 20px 20px' }}
    >
      <Stack direction='row' spacing={1.5}>
        {!appContext.isDrawerOpen && <BurgerMenu />}
        <MethodDropDown methodValue={method} setMethodValue={setMethod} />
        <UrlAutoComplete key={urlKeyRef.current} urlRef={urlRef} />
        <RequestButton methodRef={methodRef} urlRef={urlRef} headersRef={headersRef} bodyRef={bodyRef} />
      </Stack>
      <Stack direction='column' spacing={1.5} marginTop={2}>
        <RequestHeaderAutocomplete key={headerKeyRef.current} headersRef={headersRef}/>
      </Stack>
      <Stack direction='column' spacing={1.5} marginTop={2}
        sx={{ display: bodyDisplay }}
      >
        <BodyInput key={bodyKeyRef.current} bodyRef={bodyRef} />
      </Stack>
      <ProgressBar />
    </Paper>
  )
}

const BurgerMenu = () => {
  const renderCounter = React.useRef(0)
  console.log(`<BurgerMenu /> rendered ${++renderCounter.current} times`)

  const appState = useApplicationContext()//custom hook!

  return (
    <Box
      sx={{ display: 'flex', border: '0px solid black' }}
      justifyContent='flex-end'
      alignItems='flex-end'>
      <IconButton
        size='small'
        id='burger-button'
        onClick={appState.toggleDrawer}>
        <MenuIcon />
      </IconButton>
    </Box>
  )
}

const MethodDropDown = ({ methodValue, setMethodValue }: { methodValue: string, setMethodValue: (method: string) => void }) => {
  const renderCounter = React.useRef(0)
  console.log(`<MethodDropDown /> rendered ${++renderCounter.current} times`)

  const methodSelectWidth: number = 98
  return (
    <FormControl variant={RcUtils.defaultVariant}
      sx={{ border: '0px solid black', minWidth: methodSelectWidth, maxWidth: methodSelectWidth }}>
      <InputLabel id="method-select-label-id">Method</InputLabel>
      <Select
        size={RcUtils.defaultSize}
        value={methodValue}
        onChange={e => setMethodValue(e.target.value)}
        id="method-select-id"
        labelId="method-select-label-id"
        label='Method'
      >
        {
          ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH']
            .map((item) => (
              <MenuItem key={item} value={item}>{item}</MenuItem>
            )
            )
        }
      </Select>
    </FormControl>
  )
}

const BodyInput = ({ bodyRef }: { bodyRef: React.MutableRefObject<string> }) => {
  const renderCounter = React.useRef(0)
  console.log(`<BodyInput /> rendered ${++renderCounter.current} times`)
  
  //const [shrinkLabel, setShrinkLabel] = React.useState<boolean>(false)

  const onChange = (event: any) => {
    bodyRef.current = event.target.value
  }

  return (
    <TextField
      id="standard-multiline-flexible"
      label="Body"
      onChange={onChange}
      onInput={onChange}
      //InputLabelProps={{ shrink: shrinkLabel }}
      defaultValue={bodyRef.current}
      multiline
      maxRows={15}
      minRows={5}
      variant={RcUtils.defaultVariant}
    />

  )
}

const ProgressBar = () => {
  const renderCounter = React.useRef(0)
  console.log(`<ProgressBar> rendered ${++renderCounter.current} times`)

  const [visible, setVisible] = React.useState<boolean>(false)

  React.useEffect(() => {
    const progressBarEventHandle = (event: Event) => {
      console.log(`<ProgressBar> event received: ${event.type}`)
      const visible = event.type === requestSentEventType ? true : false
      setVisible(visible)
    }
    document.addEventListener(requestSentEventType, progressBarEventHandle)
    document.addEventListener(requestCompleteEventType, progressBarEventHandle)

    return () => {
      document.removeEventListener(requestSentEventType, progressBarEventHandle)
      document.removeEventListener(requestCompleteEventType, progressBarEventHandle)
    }
  }, [])

  return visible ? <Box sx={{ padding: '15px 0px 10px 0px' }}><LinearProgress color='primary' /></Box> : <Box pt={'20px'}></Box>
  // return (
  //   <LinearProgress color="primary" />
  // )
}