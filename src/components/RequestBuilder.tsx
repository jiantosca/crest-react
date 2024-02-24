import * as React from 'react';
import { RcUtils } from '../support/RestClientUtils';

import {
  Paper, Stack, InputLabel, MenuItem,
  Select, SelectChangeEvent, FormControl,
  Autocomplete, TextField, Button, IconButton,
  Box
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu'
import { useDrawerContext } from '../support/Context';

/**
 * This type doesn't enforce the calling code because they're passed as props one the react
 * component like so... 
 * 
 * <RequestBuilder isDrawerOpen={isDrawerOpen} handleDrawerOpen={handleDrawerOpen} handleDrawerClose={handleDrawerClose} />
 * 
 * But it does enforce how the method can use the type, and perhaps makes things easier to read.
 */
// type DrawerArgType = {
//   isDrawerOpen: () => boolean,
//   handleDrawerOpen: () => void,
//   handleDrawerClose: () => void
// }

export const RequestBuilder = () => {
  const renderCounter  = React.useRef(0)
  console.log(`<RequestBuilder /> rendered ${++renderCounter.current} times`)

  const [bodyDisplay, setBodyDisplay] = React.useState<string>('none')
  const methodRef = React.useRef<string>()
  const httpMethodCallback = (method: string) => {
    // TODO when we change body display, this updates state, and now all child elements gets re-rendered.
    // need to look into redux and/or @preact 
    // https://www.youtube.com/watch?v=SO8lBVWF2Y8
    ['POST', 'PUT'].includes(method) ? setBodyDisplay('') : setBodyDisplay('none')
    console.log('httpMethodCallback got ' + method);
    methodRef.current = method
  }

  const urlRef = React.useRef<string | null>()
  const urlCallback = (method: string) => {
    urlRef.current = method
  }

  const sendClickCallback = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log(`Send: ${methodRef.current} ${urlRef.current}`)
  }
  
  const drawerState = useDrawerContext()

  return (
    <Paper
      elevation={RcUtils.defaultElevation}
      //4 seems to be default radius, hate to manually set here but need to remove top radius.
      sx={{ borderRadius: '0px 0px 4px 4px', padding: '20px', margin: '0px 20px 20px 20px' }}
    >
      <Stack direction='row' spacing={1.5}>
        {!drawerState.isOpen && <BurgerMenu />}
        <MethodDropDown httpMethodCallback={httpMethodCallback} />
        <UrlAutoComplete urlCallback={urlCallback} />
        <SendButton sendClickCallback={sendClickCallback} />
        {/* 
          https://mui.com/material-ui/migration/v5-component-changes/#hidden 
          <body element> needs to hide when not post/put
        */}
      </Stack>
      <Stack direction='column' spacing={1.5} marginTop={2}>
        <HeadersInput />
      </Stack>
      <Stack direction='column' spacing={1.5} marginTop={2}
        sx={{ display: bodyDisplay }}
      >
        <BodyInput />
      </Stack>
    </Paper>
  )
}
const BurgerMenu = () => {
  const renderCounter  = React.useRef(0)
  console.log(`<BurgerMenu /> rendered ${++renderCounter.current} times`)
  
  const drawerState = useDrawerContext()//custom hook!
  
  return (
    <Box
      sx={{ display: 'flex', border: '0px solid black' }}
      justifyContent='flex-end'
      alignItems='flex-end'>
      <IconButton
        size='small'
        id='burger-button'
        onClick={drawerState.toggleDrawer}>
        <MenuIcon />
      </IconButton>
    </Box>
  )
}

const MethodDropDown = ({ httpMethodCallback }: {httpMethodCallback: (method: string) => void}) => {
  const renderCounter  = React.useRef(0)
  console.log(`<MethodDropDown /> rendered ${++renderCounter.current} times`)

  // using state instead of reference because we'll eventually want to
  // update state on like a load.
  const [method, setMethod] = React.useState<string>('GET')

  const onChangeMethod = (event: SelectChangeEvent) => {
    setMethod(event.target.value as string)
  }
  React.useEffect(() => {
    //I was getting warning below when app loads and I click burger for drawer for the first 
    //time. 
    //Warning: Cannot update a component (`RequestBuilder`) while rendering a different component 
    //(`MethodDropDown`). To locate the bad setState() call inside `MethodDropDown`
    // 
    // Stackoverflow suggested using useEffect
    //    https://stackoverflow.com/questions/62336340/cannot-update-a-component-while-rendering-a-different-component-warning
    // 
    // the last param [method] means this useEffect method will only be invoked when the method state changes.
    httpMethodCallback(method);
  }, [method]);

  const methodSelectWidth: number = 98
  return (
    <FormControl variant={RcUtils.defaultVariant} 
      sx={{ border: '0px solid black', minWidth: methodSelectWidth, maxWidth: methodSelectWidth }}>
      <InputLabel id="method-select-label-id">Method</InputLabel>
      <Select
        size={RcUtils.defaultSize}
        value={method}
        onChange={onChangeMethod}
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

const UrlAutoComplete = ({ urlCallback }: any) => {
  const renderCounter  = React.useRef(0)
  console.log(`<UrlAutoComplete /> rendered ${++renderCounter.current} times`)

  const [url, setUrl] = React.useState<string | null>('https://jsonplaceholder.typicode.com/comments/2')
  urlCallback(url)

  return (
    <Autocomplete
      size={RcUtils.defaultSize}
      fullWidth
      autoHighlight
      renderInput={(urls) => <TextField {...urls} variant={RcUtils.defaultVariant} label='URL' />}
      value={url}
      onChange={(event: any, newUrl: string | null) => setUrl(newUrl)}
      onInputChange={(event: any, newUrl: string | null) => setUrl(newUrl)}
      options={[]} //never suggest options by default, only when typeing starts
      filterOptions={RcUtils.filterUrlOptions}
      freeSolo
    />
  )
}

const SendButton = ({ sendClickCallback }: any) => {
  const renderCounter  = React.useRef(0)
  console.log(`<SendButton /> rendered ${++renderCounter.current} times`)

  return (
    //how i figure out alignment via flex https://www.youtube.com/watch?v=sKeW8r_mDS0
    <Stack direction='row'
      sx={{ display: 'flex', border: 0 }}
      justifyContent='flex-end'
      alignItems='flex-end'
    >
      <Button
        variant='contained'
        size={RcUtils.defaultSize}
        endIcon={<SendIcon />}
        onClick={sendClickCallback}
      >
        Send
      </Button>
    </Stack>
  )
}

const HeadersInput = () => {
  const renderCounter  = React.useRef(0)
  console.log(`<HeadersInput /> rendered ${++renderCounter.current} times`)

  return (
    <TextField
      id="standard-multiline-flexible"
      label="Headers"
      multiline
      variant={RcUtils.defaultVariant}
    />
  )
}
const BodyInput = () => {
  const renderCounter  = React.useRef(0)
  console.log(`<BodyInput /> rendered ${++renderCounter.current} times`)

  return (
    <TextField
      id="standard-multiline-flexible"
      label="Body"
      multiline
      maxRows={15}
      minRows={5}
      variant={RcUtils.defaultVariant}
    />

  )
}