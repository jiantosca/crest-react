import * as React from 'react'
import { RcUtils } from '../support/rest-client-utils'
import {
  Paper, Stack, InputLabel, MenuItem, Select, FormControl,
  Autocomplete, TextField, IconButton, Box, LinearProgress
}
  from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { useApplicationContext } from '../support/context'
import { RequestHeaderAutocomplete } from './RequestHeaderAutocomplete'
import { RequestSender, requestSentEventType, requestCompleteEventType } from './RequestSender'
import { FilterOptionsState } from '@mui/material'
import { Storage } from "../support/storage"
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
  }, [method])

  const urlRef = React.useRef<string>('http://localhost:8080/crest-api/test?mock=json.json&sleep=3000')
  const headersRef = React.useRef<string>('')
  const bodyRef = React.useRef<string>('')

  const appContext = useApplicationContext()

  return (
    <Paper
      elevation={RcUtils.defaultElevation}
      //4 seems to be default radius, hate to manually set here but need to remove top radius.
      sx={{ borderRadius: '0px 0px 4px 4px', padding: '20px 20px 0px 20px', margin: '0px 20px 20px 20px' }}
    >
      <Stack direction='row' spacing={1.5}>
        {!appContext.isDrawerOpen && <BurgerMenu />}
        <MethodDropDown methodValue={method} setMethodValue={setMethod} />
        <UrlAutoComplete urlRef={urlRef} />
        <RequestSender method={method} urlRef={urlRef} headersRef={headersRef} bodyRef={bodyRef} />
        {/* 
          https://mui.com/material-ui/migration/v5-component-changes/#hidden 
          <body element> needs to hide when not post/put
        */}
      </Stack>
      <Stack direction='column' spacing={1.5} marginTop={2}>
        <RequestHeaderAutocomplete headersRef={headersRef} />
      </Stack>
      <Stack direction='column' spacing={1.5} marginTop={2}
        sx={{ display: bodyDisplay }}
      >
        <BodyInput bodyRef={bodyRef} />

      </Stack>
      <ProgressBar />
    </Paper>
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

const UrlAutoComplete = ({ urlRef }: { urlRef: React.MutableRefObject<string> }) => {
  const renderCounter = React.useRef(0)
  console.log(`<UrlAutoComplete /> rendered ${++renderCounter.current} times`)

  const filterUrlOptions = (options: string[], state: FilterOptionsState<string>): string[] => {
    const trimmedInputValue = state.inputValue.trim()

    //need at least a few chars before we start suggesting stuff...
    if (trimmedInputValue.length < 3) {
      return [];
    }

    const tokens = trimmedInputValue.split(' ')
    const suggestions = [] as string[]

    // Return up to 100 suggestions when all tokens much be in the url, and the url doesn't 
    // match the current input value. URL history can get big and we don't want to be redering
    // crazy amounts of suggestions.
    Storage.listUrls().some((url) => {
      if (tokens.every(token => url.includes(token)) &&
        trimmedInputValue !== url) {
        suggestions.push(url)
      }
      return suggestions.length === 100
    })

    return suggestions
  }

  return (
    <Autocomplete
      size={RcUtils.defaultSize}
      fullWidth
      autoHighlight
      clearIcon={null}
      renderInput={(props) => <TextField {...props} variant={RcUtils.defaultVariant} label='URL' />}
      value={urlRef.current}
      onChange={(event: any, newUrl: string | null) => urlRef.current = newUrl || ''}
      onInputChange={(event: any, newUrl: string | null) => urlRef.current = newUrl || ''}
      options={[]} //never suggest options by default, only when typeing starts
      filterOptions={filterUrlOptions}
      freeSolo
    />
  )
}

const BodyInput = ({ bodyRef }: { bodyRef: React.MutableRefObject<string> }) => {
  const renderCounter = React.useRef(0)
  console.log(`<BodyInput /> rendered ${++renderCounter.current} times`)

  return (
    <TextField
      id="standard-multiline-flexible"
      label="Body"
      onChange={(event) => bodyRef.current = event.target.value}
      multiline
      maxRows={15}
      minRows={5}
      variant={RcUtils.defaultVariant}
    />

  )
}