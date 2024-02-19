import * as React from 'react';
import { RcUtils } from '../support/RestClientUtils';

import {
  Paper, Stack, InputLabel, MenuItem,
  Select, SelectChangeEvent, FormControl,
  Autocomplete, TextField, Button, IconButton,
  Menu, Box
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu'

export const RequestBuilder = ({ isDrawerOpen, handleDrawerOpen, handleDrawerClose }: any) => {
  const renderCounter  = React.useRef(0)
  console.log(`<RequestBuilder /> rendered ${++renderCounter.current} times`)

  const [bodyDisplay, setBodyDisplay] = React.useState<string>('none')
  const methodRef = React.useRef<string>()
  const methodCallback = (method: string) => {
    ['POST', 'PUT'].includes(method) ? setBodyDisplay('') : setBodyDisplay('none')
    console.log('methodCallback got ' + method);
    methodRef.current = method

  }

  const urlRef = React.useRef<string | null>()
  const urlCallback = (method: string) => {
    urlRef.current = method
  }

  const sendClickCallback = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log(`Send: ${methodRef.current} ${urlRef.current}`)
  }

  return (
    <Paper
      elevation={RcUtils.defaultElevation}
      //4 seems to be default radius, hate to manually set here but need to remove top radius.
      sx={{ borderRadius: '0px 0px 4px 4px', padding: '20px', margin: '0px 20px 20px 20px' }}
    >
      <Stack direction='row' spacing={1.5}>
        <BurgerMenu isDrawerOpen={isDrawerOpen} handleDrawerOpen={handleDrawerOpen} handleDrawerClose={handleDrawerClose} />
        <MethodDropDown methodCallback={methodCallback} />
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
const BurgerMenu = ({ isDrawerOpen, handleDrawerOpen, handleDrawerClose }: any) => {
  const renderCounter  = React.useRef(0)
  console.log(`<BurgerMenu /> rendered ${++renderCounter.current} times`)

  //now the burger stuff...
  const [iconDisplay, setIconDisplay] = React.useState<string>('')
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    (isDrawerOpen()) ? handleDrawerClose() : handleDrawerOpen()
  }

  return (
    <Box
      sx={{ display: 'flex', border: '0px solid black' }}
      justifyContent='flex-end'
      alignItems='flex-end'>
      <IconButton
        size='small'
        id='burger-button'
        onClick={handleClick}>
        <MenuIcon />
      </IconButton>
    </Box>
  )
}

const MethodDropDown = ({ methodCallback }: any) => {
  const renderCounter  = React.useRef(0)
  console.log(`<MethodDropDown /> rendered ${++renderCounter.current} times`)

  // using state instead of reference because we'll eventually want to
  // update state on like a load.
  const [method, setMethod] = React.useState<string>('GET')
  console.log('MethodDropDown:');
  console.log({ method })
  const handleMethodChange = (event: SelectChangeEvent) => {
    setMethod(event.target.value as string)
  }
  React.useEffect(() => {
    // This function will only be called once since i gave it empty array
    //
    //I was getting warning below when app loads and I click burger for drawer for the first 
    //time. 
    //Warning: Cannot update a component (`RequestBuilder`) while rendering a different component 
    //(`MethodDropDown`). To locate the bad setState() call inside `MethodDropDown`
    // 
    // Stackoverflow suggested using useEffect
    //    https://stackoverflow.com/questions/62336340/cannot-update-a-component-while-rendering-a-different-component-warning
    methodCallback(method);
  }, [method]);

  const methodSelectWidth: number = 98
  return (
    <FormControl variant={RcUtils.defaultVariant} 
      sx={{ border: '0px solid black', minWidth: methodSelectWidth, maxWidth: methodSelectWidth }}>
      <InputLabel id="method-select-label-id">Method</InputLabel>
      <Select
        size={RcUtils.defaultSize}
        value={method}
        onChange={handleMethodChange}
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

  const [url, setUrl] = React.useState<string | null>(null)
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