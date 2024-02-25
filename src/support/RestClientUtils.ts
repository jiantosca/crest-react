import { FilterOptionsState } from '@mui/material'
import { OverridableStringUnion } from "@mui/types";
import { TempUtils } from "./TempUtils";
export class RcUtils {

  static defaultVariant: 'standard' | 'outlined' | 'filled' | undefined = 'standard' //'filled', 'outlined', 'standard'
  static defaultSize: OverridableStringUnion<'medium' | 'small'> = 'medium' //only use small/medium since not all have large
  static iconButtonSize: OverridableStringUnion<'medium' | 'small' | 'large'> = 'small' //only use small/medium since not all have large
  static defaultElevation: number = 3
  /**
   * 
   * @param options we don't actually use this because we never prepopulate the autocomplete 
   * component. We would never auto suggest anything until the user starts typing at which 
   * point this method returns a filtered url list.
   * @param state 
   * @returns 
   */
  static filterUrlOptions(options: string[], state: FilterOptionsState<string>): string[] {
    const trimmedInputValue = state.inputValue.trim()
    //need a few chars before we start suggesting stuff...
    if(trimmedInputValue.length < 3) {
      return [];
    }

    const tokens = trimmedInputValue.split(' ')

    const suggestions = TempUtils.testUrls.filter((url) => 
      tokens.every(token => url.includes(token)))

    // console.log({ tokens })
    // console.log(state)

    return suggestions
  }
}

type NameValuePair = {
  name: string
  value: string
}
export type HttpExchangeContext = {
  timedout: boolean
  aborted: boolean
  startTime?: number
  endTime?: number

  request: {
    method: string
    url: string
    headers: NameValuePair[]
    body?: string
    headersAndBody: string
  }

  response: {
    statusCode: number
    headers: NameValuePair[]
    body?: string
    headersAndBody: string
  }
}