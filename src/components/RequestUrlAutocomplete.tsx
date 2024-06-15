import * as React from 'react'
import { RcUtils } from '../support/rest-client-utils'
import {
  Autocomplete, TextField
} from '@mui/material'
import { FilterOptionsState } from '@mui/material'
import { Storage } from "../support/storage"
import { loadRequestEventType } from './RequestBuilder'
import { triggerSendEventType } from './RequestButton'

export const UrlAutoComplete = ({ urlRef }: { urlRef: React.MutableRefObject<string> }) => {
    const renderCounter = React.useRef(0)
    console.log(`<UrlAutoComplete /> rendered ${++renderCounter.current} times`)
    const savedPrefix = 'saved: '
    const oauthPrefix = 'crest-oauth: '
    
    const filterUrlOptions = (options: string[], state: FilterOptionsState<string>): string[] => {
      const trimmedInputValue = state.inputValue.trim()
  
      //need at least a few chars before we start suggesting stuff...
      if (trimmedInputValue.length < 3) {
        return [];
      }

      const tokens = trimmedInputValue.toLowerCase().split(' ')
          .filter(token => token !== '')
      
      const suggestions = [] as string[]

      // Return up to 100 suggestions when all tokens are in the stored item (typically a url), and
      // the item doesn't match the current input value. URL history can get big and we don't want
      // to be rederingc razy amounts of suggestions.
      [ ...Storage.listHttpRequests().map(httpRequest => savedPrefix + httpRequest.name), 
        ...Storage.listOAuths().map(oauth => oauthPrefix + oauth.name), 
        ...Storage.listUrls().sort(), 
        ...Storage.listCRestPersistenceUrls()].some((url) => {
          if (tokens.every(token => url.toLowerCase().includes(token)) && trimmedInputValue !== url) {
            suggestions.push(url)
          }
          return suggestions.length === 100
      })
  
      return suggestions 
    }
  
    //const appContext = useApplicationContext()
  
    const onChange = (event: React.SyntheticEvent, newUrl: string | null) => {
      if(!event) {
        return
      }
      //loadBundleEventType
      if(newUrl?.startsWith(savedPrefix) || newUrl?.startsWith(oauthPrefix)) {
        const name = newUrl.split(savedPrefix)[1] || newUrl.split(oauthPrefix)[1]
        const httpRequest = Storage.getHttpRequest(name) || Storage.getOAuth(name)
        const loadEvent = new CustomEvent(loadRequestEventType, { detail: httpRequest })
        document.dispatchEvent(loadEvent)
      } else {
        urlRef.current = newUrl || ''
      }
      
    }
  
    // can use this to better control what's rendered in the options list but need to fiddle
    // with it more to get it right.
    //
    const renderOption = (props: any, option: string) => {
      // setting to false only partially fixes issue where previous value in auto suggest is selected. Maybe not even an issue. But what i'd like is for
      // every time the suggestions pop up it selection starts with first item, but what happes in last selected item is selected. No biggie really.
      props['aria-selected'] = false
  
      if(option.startsWith(savedPrefix)) {
        return (
          <li {...props}><b>{savedPrefix}</b>&nbsp;{option.replace(savedPrefix, '')}</li>
        )
      } else if(option.startsWith(oauthPrefix)) {
        return (
          <li {...props}><b>{oauthPrefix}</b>&nbsp;{option.replace(oauthPrefix, '')}</li>
        )
      } else {
        return (<li {...props}>{option}</li>)
      }
    }
    
    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        document.dispatchEvent(new Event(triggerSendEventType))
      }
    }

    return (
      <Autocomplete
        size={RcUtils.defaultSize}
        fullWidth
        autoHighlight
        clearIcon={null}
        renderOption={renderOption}
        renderInput={(props) => <TextField {...props} variant={RcUtils.defaultVariant} label='URL' />}
        value={urlRef.current}
        onChange={onChange}
        onInputChange={onChange}
        onKeyDown={handleKeyDown}
        options={[]} //never suggest options by default, only when typeing starts
        filterOptions={filterUrlOptions}
        freeSolo
      />
    )
  }