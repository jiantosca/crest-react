import React from 'react'
import { Button, ButtonGroup, Paper, Stack, TextField } from '@mui/material'
import {
    InputLabel, MenuItem, Select, FormControl
} from '@mui/material'
import { RcUtils } from '../support/rest-client-utils'
import { UrlAutoComplete } from './RequestUrlAutocomplete'
import { RequestHeaderAutocomplete } from './RequestHeaderAutocomplete'
import { HttpRequestBundle } from '../support/http-exchange'

/**
 * For now this comp will have a fair amount of code duplication with the RequestBuilder comp. This comp I plan to use in a popup dialog
 * so the user can edit and save requests. I'm not sure how I feel about this UX so I don't want to be refactoring the RequestBuilder comp
 * at this point to avoid the code duplication. Overall it's not too much duplication.
 */
export const RequestEditor = ({bundle}: {bundle: HttpRequestBundle} ) => {
    const renderCounter = React.useRef(0)
    renderCounter.current++
    console.log(`<RequestEditor /> rendered ${renderCounter.current} times`)

    const [bodyDisplay, setBodyDisplay] = React.useState<string>('none')
    const [method, setMethod] = React.useState<string>((bundle.method) ? bundle.method : 'GET')
    React.useEffect(() => {
        ['POST', 'PUT'].includes(method) ? setBodyDisplay('') : setBodyDisplay('none')
        //methodRef.current = method
    }, [method])

    const headers = (!bundle.headers) ? '' : bundle.headers.map((header) => `${header.name}: ${header.value}`).join('\n')

    const nameRef = React.useRef((bundle.name) ? bundle.name : bundle.id)
    const urlRef = React.useRef<string>((bundle.url) ? bundle.url : '')
    const headersRef = React.useRef<string>(headers)
    const bodyRef = React.useRef<string>((bundle.body) ? bundle.body : '')

    React.useEffect(() => {
        console.log('RequestEditor useEffect')
        console.log('RequestEditor useEffect')
        console.log('RequestEditor useEffect')
        console.log('RequestEditor useEffect')
        console.log('RequestEditor useEffect')

        return () => {
            console.log('RequestEditor useEffect cleanup')
            console.log('RequestEditor useEffect cleanup')
            console.log('RequestEditor useEffect cleanup')
            console.log('RequestEditor useEffect cleanup')

        }
    })

    return (
        <Paper elevation={RcUtils.defaultElevation} sx={{ borderRadius: '4px', padding: '20px', minWidth: '50vw'}}>
            <Stack direction='row' spacing={1.5}>
                <TextField
                    fullWidth
                    label="Name"
                    defaultValue={nameRef.current}
                    variant={RcUtils.defaultVariant}
                    onChange={(e) => nameRef.current = e.target.value} />
            </Stack>
            <Stack direction='row' spacing={1.5} marginTop={2}>
                <MethodDropDown methodValue={method} setMethodValue={setMethod} />
                <UrlAutoComplete key='editorUrlAutoCompleteKey' urlRef={urlRef} />
            </Stack>
            <Stack direction='column' spacing={1.5} marginTop={2}>
                <RequestHeaderAutocomplete key='editorRequestHeaderAutocompleteKey' headersRef={headersRef}/>
            </Stack>
            <Stack direction='column' spacing={1.5} marginTop={2} sx={{ display: bodyDisplay }}>
                <BodyInput key='editorBodyInputKey' bodyRef={bodyRef} />
            </Stack>
            <Stack direction='row' marginTop={2} justifyContent='flex-end'>
                <ButtonGroup variant='outlined' orientation='horizontal' color="primary" size="small">
                    <Button>Save</Button>
                    <Button>Load</Button>
                    <Button>Delete</Button>
                </ButtonGroup>
            </Stack>
        </Paper>
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
