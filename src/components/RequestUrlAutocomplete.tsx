import * as React from 'react'
import { RcUtils } from '../support/rest-client-utils'
import {
  Autocomplete, TextField
} from '@mui/material'
import { FilterOptionsState } from '@mui/material'
import { Storage } from "../support/storage"
import { loadBundleEventType } from './RequestBuilder'

export const UrlAutoComplete = ({ urlRef }: { urlRef: React.MutableRefObject<string> }) => {
    const renderCounter = React.useRef(0)
    console.log(`<UrlAutoComplete /> rendered ${++renderCounter.current} times`)
    const bundlePrefix = 'bundle: '
    const oauthPrefix = 'crest-oauth: '
    
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
      [ ...Storage.listBundles().map(bundle => bundlePrefix + bundle.name), 
        ...Storage.listOAuths().map(oauth => oauthPrefix + oauth.id), 
        ...Storage.listUrls(), 
        ...Storage.listPersistenceUrls()].sort().some((url) => {
        if (tokens.every(token => url.includes(token)) &&
          trimmedInputValue !== url) {
          suggestions.push(url)
        }
        return suggestions.length === 100
      })
  
      return suggestions 
    }
  
    //const appContext = useApplicationContext()
  
    const onBundleSupporedChange = (event: React.SyntheticEvent, newUrl: string | null) => {
      if(!event) {
        return
      }
      //loadBundleEventType
      if(newUrl?.startsWith(bundlePrefix) || newUrl?.startsWith(oauthPrefix)) {
        const name = newUrl.split(bundlePrefix)[1] || newUrl.split(oauthPrefix)[1]
        const bundleOrOauth = Storage.getBundle(name) || Storage.getOAuth(name)
        const loadEvent = new CustomEvent(loadBundleEventType, { detail: bundleOrOauth })
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
  
      if(option.startsWith(bundlePrefix)) {
        return (
          <li {...props}><b>{bundlePrefix}</b>&nbsp;{option.replace(bundlePrefix, '')}</li>
        )
      } else if(option.startsWith(oauthPrefix)) {
        return (
          <li {...props}><b>{oauthPrefix}</b>&nbsp;{option.replace(oauthPrefix, '')}</li>
        )
      } else {
        return (<li {...props}>{option}</li>)
      }
    }
  
    return (
      <Autocomplete
        size={RcUtils.defaultSize}
        fullWidth
        autoHighlight
        //clearIcon={null}
        renderOption={renderOption}
        renderInput={(props) => <TextField {...props} variant={RcUtils.defaultVariant} label='URL' />}
        value={urlRef.current}
        onChange={onBundleSupporedChange}
        onInputChange={onBundleSupporedChange}
        options={[]} //never suggest options by default, only when typeing starts
        filterOptions={filterUrlOptions}
        freeSolo
      />
    )
  }