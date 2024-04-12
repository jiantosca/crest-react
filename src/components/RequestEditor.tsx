import React from 'react'
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import {
    InputLabel, MenuItem, Select, FormControl
} from '@mui/material'
import { RcUtils } from '../support/rest-client-utils'
import { UrlAutoComplete } from './RequestUrlAutocomplete'
import { RequestHeaderAutocomplete } from './RequestHeaderAutocomplete'
import { HttpRequest, NameValuePair } from '../support/http-exchange'
import { useApplicationContext } from '../support/react-contexts';
import SaveIcon from '@mui/icons-material/Save';
import {Storage} from '../support/storage'

/**
 * For now this comp will have a fair amount of code duplication with the RequestBuilder comp. This comp I plan to use in a popup dialog
 * so the user can edit and save requests. I'm not sure how I feel about this UX so I don't want to be refactoring the RequestBuilder comp
 * at this point to avoid the code duplication. Overall it's not too much duplication.
 */
export const RequestEditor = ({ httpRequest, isOauth, setRequests}: 
                              { httpRequest: HttpRequest, 
                                isOauth?: boolean,
                                setRequests?: React.Dispatch<React.SetStateAction<HttpRequest[]>>} ) => {

    const renderCounter = React.useRef(0)
    renderCounter.current++
    console.log(`<RequestEditor /> rendered ${renderCounter.current} times`)
    const [bodyDisplay, setBodyDisplay] = React.useState<string>('none')
    const [method, setMethod] = React.useState<string>((httpRequest.method) ? httpRequest.method : 'GET')
    React.useEffect(() => {
        ['POST', 'PUT'].includes(method) ? setBodyDisplay('') : setBodyDisplay('none')
        //methodRef.current = method
    }, [method])

    const headers = (!httpRequest.headers) ? '' : httpRequest.headers.map((header) => `${header.name}: ${header.value}`).join('\n')

    const nameRef = React.useRef(httpRequest.name)
    const urlRef = React.useRef<string>(httpRequest.url)
    const headersRef = React.useRef<string>(headers)
    const bodyRef = React.useRef<string>((httpRequest.body) ? httpRequest.body : '')

    const [problems, setProblems] = React.useState<React.ReactElement[]>([])

    const appContext = useApplicationContext()

    const handleSave = () => {

        const toAlert = (msg: string, key: number) => <Alert key={key} severity="error"><Typography>{msg}</Typography></Alert>
        
        const saveProblems: React.ReactElement[] = []
        if(!nameRef.current) {
            saveProblems.push(toAlert('Name is required', saveProblems.length))
        }
        if (!urlRef.current.startsWith('http://') &&
            !urlRef.current.startsWith('https://') && 
            !urlRef.current.startsWith('crest://')) {
                saveProblems.push(toAlert('Enter a valid URL that starts with http:// or https://', saveProblems.length))
        }
        //check name not null and doesn't conflict with existing names
        //check url not null
        const headerLines = headersRef.current.split('\n').filter(header => header.trim() !== '')
        const headerNameValues: NameValuePair[] = (headerLines.length > 0) ?
        headerLines.map(header => {
          const nameValue = RcUtils.parseHeaderLine(header)
          if( !nameValue.name || !nameValue.value) {
            saveProblems.push(toAlert(`Invalid header '${header}'`, saveProblems.length))
          }
          return nameValue
        }) : []

        const isEdit = httpRequest.name ? true : false

        console.log('isOauth: ', isOauth)
        console.log('isEdit: ', isEdit)

        //could be savedRequests or oauths
        const httpRequestsFromStorage = (isOauth) ? Storage.listOAuths() : Storage.listHttpRequests()

        const findDuplicateNameProblem = (name: string): void => {
            const namesToCheck = httpRequestsFromStorage.map((req) => req.name)
            // saved request: GET Local oauth-protected
            // saved oauth  : crest sleep 1000 expires 5 mins
            for(let i = 0; i < namesToCheck.length; i++) {
                if(namesToCheck[i] === nameRef.current) {
                    const prefix = (isOauth) ? 'An oauth ' : 'A request'
                    saveProblems.push(toAlert(`${prefix} named '${nameRef.current}' already exists, please pick another name.`, saveProblems.length))
                    return
                }
            }
        }

        if(!isEdit || (isEdit && nameRef.current !== httpRequest.name)) {
            findDuplicateNameProblem(nameRef.current);
        }

        if(saveProblems.length > 0) {
            setProblems(saveProblems)
            return
        }

        // const namesToCheck = ((isOauth) ? Storage.listOAuths() : Storage.listHttpRequests()).map((req) => req.name)

        // // saved request: GET Local oauth-protected
        // // saved oauth  : crest sleep 1000 expires 5 mins
        // for(let i = 0; i < namesToCheck.length; i++) {
        //     if(namesToCheck[i] === nameRef.current) {
        //         const prefix = (isOauth) ? 'An oauth ' : 'A request'
        //         saveProblems.push(toAlert(`${prefix} named '${nameRef.current}' already exists, please pick another name.`, saveProblems.length))
        //         setProblems(saveProblems)
        //         return
        //     }
        // }

        const newRequest: HttpRequest = {
            name: nameRef.current,
            id: httpRequest.id,
            timestamp: httpRequest.timestamp,
            method: method,
            url: urlRef.current,
            headers: headerNameValues,
            body: bodyRef.current
        }

        if(isEdit) {
            const index = httpRequestsFromStorage.findIndex(req => req.name === httpRequest.name)
            httpRequestsFromStorage[index] = newRequest
        } else {
            httpRequestsFromStorage.push(newRequest)
        }

        if(isOauth) {
            Storage.storeOAuths(httpRequestsFromStorage)
            //if we rename an oauth, we need to update any saved requests that reference it
            if(isEdit && nameRef.current !== httpRequest.name) {
                const requests = Storage.listHttpRequests()
                for(let i = 0; i < requests.length; i++) {
                    const headers = requests[i].headers
                    for(let j = 0; j < headers.length; j++) {
                        if(headers[j].name === 'crest-oauth' && headers[j].value === httpRequest.name) {
                            headers[j].value = nameRef.current
                        }
                    }
                }
                Storage.storeHttpRequests(requests)
            }
        } else {
            Storage.storeHttpRequests(httpRequestsFromStorage)
        }
        // setRequest not passed when saving request history item. But it is when updating or copying an oauth, setRequests is passed so that
        // we can trigger a rerender of the oauth or saved requests tab.
        if(setRequests) {
            setRequests(httpRequestsFromStorage)
        }
        
        appContext.hideDialog()
    }

    return (
        <Paper elevation={RcUtils.defaultElevation} sx={{ borderRadius: '4px', padding: '20px', minWidth: '60vw'}}>
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
            <Stack direction='row' marginTop={2} spacing={1.5} justifyContent='space-between'>
                {problems.length > 0 ? <Stack direction='column' spacing={1}>{problems}</Stack> : <Box/>}
                <Box><Button variant='contained' size='small' endIcon={<SaveIcon />} onClick={handleSave}>Save</Button></Box>
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
