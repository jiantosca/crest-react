import { Autocomplete, TextField } from '@mui/material'
import * as React from 'react'
import { RcUtils } from '../support/RestClientUtils'
import { ChangeEvent } from 'react'
import { Storage } from "../support/Storage";


/**
 * HeadeOptionType is used to control the options that are displayed in the auto suggest box when the user is typing, as well as 
 * populating the text area when the user selects an option.
 * 
 * It has two fields: 
 * 
 * suggested: what's displayed in the suggestion/option box for the user to pick
 * value: what gets put in the text area when user selects an option
 * 
 * When a user selects a suggested option, the MUI Autocomplete will replace *everything* in the text area with the value field. So
 * it's important that the value field includes the existing lines of text in the text area. This is handled in the getFilterOptions
 * 
 * All that said, 3 more  things to note:
 * 
 * 1. filterOptions={getFilterOptions} - this is a property on the <Autocomplete> component that calls the getFilterOptions method to
 *    get the options that should be displayed in the auto suggest box when the user is typing. It will only show suggestions if the
 *    user has typed at least 3 characters on the last line of the text area. It will ensure the value prop of each suggestion includes
 *    the existing lines of text in the text area for reasons previously mentioned. Oh, and it will only show suggestions that don't
 *    already exist in the text area.
 *  
 * 2. renderOption - another property on the <Autocomplete> component that allows us to control how the options are displaayed. In our
 *    case this mostly means we want the "suggested" property of the HeadeOptionType to be displayed in the suggestion box. Typical usage
 *    of an <Autocomplete> deals with strings so no need to figure out how to display the options.
 * 
 * 3. getOptionLabel - another property on the <Autocomplete> component. This one is used to control what's displayed in the text area when
 *    a user selects an option. As previously mentioned, this is the value property of the HeadeOptionType which includes any previously 
 *    selected items already in the text area. 
 * 
 * Maybe one more thing... i had this all working in a much simpler way using a the useState hook for the value of the text area. All i had 
 * to do was to detect the user making a selection, append it to the current text area value, and set state. Problem was if the text area
 * has multiple lines already (common case), the <Autocomplete> component would first replace the text area value with the single seclected
 * item causing it to shrink, them my code would set the correct state causing it to grow again. This caused a quick flash that I just 
 * couldn't figure out how to get rid of :(
 */
type HeadeOptionType = {
    suggested: string;
    value: string;
}
export const RequestHeaderAutocomplete = ({ headersRef }: { headersRef: React.MutableRefObject<string> }) => {
    const renderCounter = React.useRef(0)
    console.log(`<HeadersInput /> rendered ${++renderCounter.current} times`)

    const isSuggesting = React.useRef(false)
    const isOnTheLastLine = React.useRef(true)

    /**
     * Returns the options that should be displayed in the auto suggest box when the user is typing. 
     */
    const getFilterOptions = (options: HeadeOptionType[], state: any): HeadeOptionType[] => {
        const lines = state.inputValue.split('\n')
        const lastLine = lines.pop().trim()

        if (!isOnTheLastLine.current || lastLine.length < 3) {
            isSuggesting.current = false//don't think i need to do this one but just in case
            return []
        }

        const tokens: string[] = lastLine.split(' ')

        const existingHeaders = lines.map((line: string) => line.toLowerCase())

        const stringSuggestions = Storage.listHeaders().filter((header) => { 
            const lcHeader = header.toLowerCase()
            return !existingHeaders.includes(lcHeader) && 
                tokens.every(token => header.toLowerCase().includes(token.toLowerCase()))
        })
        const previousLines = lines.join('\n')
        const suggestions: HeadeOptionType[] = stringSuggestions.map((suggested) => {
            return {
                suggested: suggested,
                value: (previousLines + '\n' + suggested).trim() + '\n'
            }
        })

        isSuggesting.current = suggestions.length > 0 ? true : false;

        return suggestions
    }

    /**
     * As the user types we need to know if they're on the last line of the text area so that we know wheather to show suggestions or not.
     * @param event 
     */
    const onInput = (event: ChangeEvent<HTMLInputElement>) => {
        headersRef.current = event.target.value
        // get the location of the cursor. While triggering "onInput" event nothing would be selected so we can use
        // selectionStart or selectionEnd to get the cursor position. Both would be the same index since no selection.
        const selectionEnd = event.target.selectionEnd || 0
        const curosorToEndString = event.target.value.substring(selectionEnd, event.target.value.length)
        if (curosorToEndString.includes('\n')) {
            isOnTheLastLine.current = false
        } else {
            isOnTheLastLine.current = true
        }

        //console.log(`onInput ${event.target.selectionStart}:${event.target.selectionEnd}>` + event.target.value.substring(selectionEnd, event.target.value.length) + '<')

    }
            
    return (
        <Autocomplete
            size={RcUtils.defaultSize}
            fullWidth
            //don't highlight first option by default
            autoHighlight={false}
            //returns our text area 
            renderInput={(props) =>
                <TextField {...props} variant={RcUtils.defaultVariant} label='Headers' multiline
                    onInput={onInput}
                />
            }
            //called for each suggestion/option we want to render
            renderOption={(props, option: HeadeOptionType) => <li {...props}>{option.suggested}</li>}
            //used to control what's displayed in the text area when a user selects an option
            getOptionLabel={(option: string | HeadeOptionType) =>
                typeof option === "string" ? option : option.value
            }
            onClose={(event: React.SyntheticEvent, reason: string) => {
                isSuggesting.current = false
            }}
            onChange={(event: React.SyntheticEvent, selected: any, reason: string) => {
                if (reason === 'selectOption') { // One of "createOption", "selectOption", "removeOption", "blur" or "clear".
                    headersRef.current = selected.value
                }
            }}
            clearIcon={null}
            selectOnFocus={false}
            options={[]} //never suggest options by default, only when typing starts
            filterOptions={getFilterOptions}
            //This event allows us to use arrow keys in the textarea when suggestions aren't presented. By default the autocomplete component
            //uses arrows to show/hide suggestion box, but we don't want that in a text area. Only allow this default behavior if we're suggesting
            //so you can navigate options, but if not suggesting arrows should move around the cursor in the textarea.
            onKeyDown={(event: React.KeyboardEvent & { defaultMuiPrevented?: boolean }) => {
                if (isSuggesting.current) {
                    return;
                } else if ((event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
                    event.defaultMuiPrevented = true;
                }
            }}
            freeSolo
        />
    )
}