import * as React from 'react'
import { RcUtils } from '../support/RestClientUtils'
import {
  Paper, Stack, InputLabel, MenuItem,Select, FormControl,
  Autocomplete, TextField, IconButton, Box, Typography, Alert } 
  from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import MenuIcon from '@mui/icons-material/Menu'
import { useApplicationContext, useHttpExchangeContext } from '../support/Context'
import { LoadingButton } from '@mui/lab'
import { Storage } from '../support/Storage'
import { HttpExchange, HttpRequest, NameValuePair } from '../support/type.http-exchange'
import { HttpExchangeHandler } from '../support/http-exchange-handler'
import { RequestHeaderAutocomplete } from './RequestHeaderAutocomplete'

/**
 * 
 * The RequestionBuilder is mostly composed of other components to help build http requests. In order
 * of how they show up in the UI, they are:
 * 
 * 1. BurgerMenu - a hamburger menu icon that when clicked toggles the drawer open/closed.
 * 2. MethodDropDown - a dropdown to select the http method (GET, POST, PUT, DELETE, etc).
 * 3. UrlAutoComplete - an autocomplete component for the url input.
 * 4. SendButton - a button to send the http request.
 * 5. RequestHeaderAutocomplete - an autocomplete component for the headers input. This is the only 
 *    component imported from it's own file since it's not so simple.
 * 6. BodyInput - a text area for the body input.
 * 
 * A few other things to note:
 *   - The RequestBuilder centralizes all the data needed to submit request through the use of various
 *     state vars, and refs that it passes down to the child components.
 *   - The RequestBuilder also centralizes the logic to submit the request through the use of a callback
 *     method that it passes down to the SendButton component.
 *   - The RequestBuilder also has logic deal with responses through the use of a callback sent to the
 *     HttpExchangeHandler.submitRequest method. When a successful response is received, the RequestBuilder
 *     store the url and headers in storage for auto complete suggestions. Then it will set the httpExchangeHolder
 *     through the use of the useHttpExchangeContext custom hook which triggers rendering of the HttpResponses
 *     that will include the new response in the UI. More details on  how this works in the HttpResponses component.
 */
export const RequestBuilder = () => {
  const renderCounter = React.useRef(0)
  renderCounter.current++
  console.log(`<RequestBuilder /> rendered ${renderCounter.current} times`)

  //method realated stuff for body display which shows/hides body input
  //if method is post/put, and method. The method state is example of 
  //property lifting. The method state is lifted up to the parent component.
  //and passed to child <MethodDropDown/> comp.
  const [bodyDisplay, setBodyDisplay] = React.useState<string>('none')
  const [method, setMethod] = React.useState<string>('GET')
  React.useEffect(() => {
    ['POST', 'PUT'].includes(method) ? setBodyDisplay('') : setBodyDisplay('none')
  }, [method])

  //use ref this time since no need to rerender this comp when url changes
  const urlRef = React.useRef<string>('http://localhost:8080/crest-api/test?mock=json.json')
  const headersRef = React.useRef<string>('')
  const bodyRef = React.useRef<string>('')

  const appContext = useApplicationContext()
  const {setHttpExchangeHolder} = useHttpExchangeContext()

  const sendClickCallback = async (event: React.MouseEvent<HTMLButtonElement>) => {

    const headerLines = headersRef.current.trim().split('\n')
        .filter(header => header.trim() !== '')

    const problems: string[] = []

    if(urlRef.current.trim() === '' || !urlRef.current.startsWith('http')) {
      problems.push('Enter a valid URL that starts with http or https')
    }

    const headerNameValues: NameValuePair[] = (headerLines.length > 0) ?
      headerLines.map(header => {
        const [name, ...value] = header.split(':');
        if(value.length === 0) {
          problems.push(`"${name}" doesn't appear to be a valid header`)
        }
        return {name: name, value: value.join(':').trim()} as NameValuePair
      }) : []

    if(problems.length > 0) {
      //simple list...
      // const problemListItems = problems.map(problem => <ListItem><ListItemText>{problem}</ListItemText></ListItem>)
      // appContext.showDialog('Request Issues', <List dense>{problemListItems}</List>)
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

    const httpExchangeCallback = (httpExchange: HttpExchange) => {
      console.log(httpExchange)
      if(!RcUtils.isExtensionRuntime()) {
        httpExchange.response.headers.push({name: 'headers-suppressed', value: 'because not running as extension (see fetch & Access-Control-Expose-Headers)'})
      }
      if(httpExchange.response.statusCode === 0) {
        appContext.showDialog('Network Error', 
          <Alert severity="error">
            {/* component='div' so each typography is on a new line */}
            <Typography component="div">No response from the server. Ensure your URL is correct.</Typography>
            {httpExchange.request.url.startsWith('https') && <Typography component="div" pt={1}>This could also be due to SSL issues. You could add an exception in chrome if appropriate.</Typography>}
          </Alert>)

          return //return so we don't paint a response with a 0 status code
      }

      if(httpExchange.response.statusCode < 300) {
        Storage.storeUrl(httpRequest.url)
        Storage.storeHeaders(headerLines)
      }
      setHttpExchangeHolder({value: httpExchange});
    }
    
    if(RcUtils.isExtensionRuntime()) {
      console.log('RequestBuilder.sendClickCallback running as extension')
      chrome.runtime.sendMessage(httpRequest, httpExchangeCallback);
    } else {
      console.log('RequestBuilder.sendClickCallback not running as extension')
      new HttpExchangeHandler(httpRequest).submitRequest(httpExchangeCallback)
    }
  }

  return (
    <Paper
      elevation={RcUtils.defaultElevation}
      //4 seems to be default radius, hate to manually set here but need to remove top radius.
      sx={{ borderRadius: '0px 0px 4px 4px', padding: '20px', margin: '0px 20px 20px 20px' }}
    >
      <Stack direction='row' spacing={1.5}>
        {!appContext.isDrawerOpen && <BurgerMenu />}
        <MethodDropDown methodValue={method} setMethodValue={setMethod} />
        <UrlAutoComplete urlRef={urlRef} />
        <SendButton sendClickCallback={sendClickCallback} />
        {/* 
          https://mui.com/material-ui/migration/v5-component-changes/#hidden 
          <body element> needs to hide when not post/put
        */}
      </Stack>
      <Stack direction='column' spacing={1.5} marginTop={2}>
        <RequestHeaderAutocomplete headersRef={headersRef}/>
      </Stack>
      <Stack direction='column' spacing={1.5} marginTop={2}
        sx={{ display: bodyDisplay }}
      >
        <BodyInput bodyRef={bodyRef}/>
      </Stack>
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

const UrlAutoComplete = ({urlRef} : {urlRef: React.MutableRefObject<string>}) => {
  const renderCounter = React.useRef(0)
  console.log(`<UrlAutoComplete /> rendered ${++renderCounter.current} times`)

  return (
    <Autocomplete
      size={RcUtils.defaultSize}
      fullWidth
      autoHighlight
      renderInput={(props) => <TextField {...props} variant={RcUtils.defaultVariant} label='URL' />}
      value={urlRef.current}
      onChange={(event: any, newUrl: string | null) => urlRef.current = newUrl || ''}
      onInputChange={(event: any, newUrl: string | null) => urlRef.current = newUrl || ''}
      options={[]} //never suggest options by default, only when typeing starts
      filterOptions={RcUtils.filterUrlOptions}
      freeSolo
    />
  )
}

const SendButton = ({ sendClickCallback }: any) => {
  const renderCounter = React.useRef(0)
  console.log(`<SendButton /> rendered ${++renderCounter.current} times`)
  const [sending, setSending] = React.useState<boolean>(false)
  const handleClick = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      sendClickCallback();
    }, 700);
  }
  return (
    //how i figure out alignment via flex https://www.youtube.com/watch?v=sKeW8r_mDS0
    <Stack direction='row'
      sx={{ display: 'flex', border: 0 }}
      justifyContent='flex-end'
      alignItems='flex-end'
    >
      {/* <Button
        variant='contained'
        color='primary'
        //size={RcUtils.defaultSize}
        size='small'
        endIcon={<SendIcon />}
        onClick={sendClickCallback}
      >
        Send
      </Button> */}
      <LoadingButton
        size="small"
        onClick={handleClick}
        endIcon={<SendIcon />}
        loading={sending}
        loadingPosition="end"
        variant="contained"
      >
        <span>Send</span>
      </LoadingButton>
    </Stack>
  )
}

const BodyInput = ({bodyRef} : {bodyRef: React.MutableRefObject<string>}) => {
  const renderCounter = React.useRef(0)
  console.log(`<BodyInput /> rendered ${++renderCounter.current} times`)

  return (
    <TextField
      id="standard-multiline-flexible"
      label="Body"
      onChange={(event) => bodyRef.current = event.target.value }
      multiline
      maxRows={15}
      minRows={5}
      variant={RcUtils.defaultVariant}
    />

  )
}