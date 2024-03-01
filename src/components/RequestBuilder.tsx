import * as React from 'react'
import { RcUtils } from '../support/RestClientUtils'
import {
  Paper, Stack, InputLabel, MenuItem,Select, FormControl,
  Autocomplete, TextField, IconButton, Box } 
  from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import MenuIcon from '@mui/icons-material/Menu'
import { useApplicationContext } from '../support/Context'
import { LoadingButton } from '@mui/lab'
import { TempUtils } from '../support/TempUtils'

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
    //see comments in RcUtils.dispatchFantomScroll() for why we dispatch a scroll event here.
    RcUtils.dispatchFantomScroll()
  }, [method])

  //use ref this time since no need to rerender this comp when url changes
  const urlRef = React.useRef<string>('https://some.initial/url/to-be-removed')
  const headersRef = React.useRef<string>('')
  const bodyRef = React.useRef<string>('')

  const appState = useApplicationContext()

  const sendClickCallback = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log(`\n*******************************************************`)
    console.log(`${method} ${urlRef.current}`)
    console.log(`\n${headersRef.current}`)
    console.log(`\n${bodyRef.current}`)
    console.log(`*******************************************************\n\n`)
    const guid = RcUtils.generateGUID()
    const exchange = (renderCounter.current % 2 === 0) ? TempUtils.createHttpExchangeContext1(guid, guid) : TempUtils.createHttpExchangeContext2(guid, guid)
    appState.setHttpExchangeHolder({ value: exchange })
  }

  return (
    <Paper
      elevation={RcUtils.defaultElevation}
      //4 seems to be default radius, hate to manually set here but need to remove top radius.
      sx={{ borderRadius: '0px 0px 4px 4px', padding: '20px', margin: '0px 20px 20px 20px' }}
    >
      <Stack direction='row' spacing={1.5}>
        {!appState.isDrawerOpen && <BurgerMenu />}
        <MethodDropDown methodValue={method} setMethodValue={setMethod} />
        <UrlAutoComplete urlRef={urlRef} />
        <SendButton sendClickCallback={sendClickCallback} />
        {/* 
          https://mui.com/material-ui/migration/v5-component-changes/#hidden 
          <body element> needs to hide when not post/put
        */}
      </Stack>
      <Stack direction='column' spacing={1.5} marginTop={2}>
        <HeadersInput headersRef={headersRef}/>
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
      renderInput={(urls) => <TextField {...urls} variant={RcUtils.defaultVariant} label='URL' />}
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

const HeadersInput = ({headersRef} : {headersRef: React.MutableRefObject<string>}) => {
  const renderCounter = React.useRef(0)
  console.log(`<HeadersInput /> rendered ${++renderCounter.current} times`)

  // const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (event) => {
  //   const newHeaders = event.target.value 
  //   headersRef.current = newHeaders
  // }

  return (
    <TextField
      id="standard-multiline-flexible"
      label="Headers"
      // onChange={handleChange}
      onChange={(event) => headersRef.current = event.target.value }
      multiline
      variant={RcUtils.defaultVariant}
    />
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