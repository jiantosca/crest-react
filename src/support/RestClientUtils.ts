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
    if (trimmedInputValue.length < 3) {
      return [];
    }

    const tokens = trimmedInputValue.split(' ')

    const suggestions = TempUtils.testUrls.filter((url) =>
      tokens.every(token => url.includes(token)))

    // console.log({ tokens })
    // console.log(state)

    return suggestions
  }

  /**
    * Some component widths are based on whether or not the scrollbar is visible. In particular
    * the HttpResponses component which has listeners to detect window resize and scroll events
    * to know when to adjust its width. The method drop down can cause the vertical scrollbar
    * to appear or disappear w/out any resize/scroll events, and so does loading new responses.
    * So we'll dispatch a scroll event allowing compoenents to adjust their width. Maybe hacky, 
    * but seems a lot simpler than managing more crazy state between components.
    * 
    * Need to use setTimeout otherwise the scroll event is dispatched before the scrollbar is actually
    * visible or hidden.
    */
  static dispatchFantomScroll() {
    //window.dispatchEvent(new Event('scroll'));
    setTimeout(function () {
      window.dispatchEvent(new Event('scroll'));
    }, 20);
  }

  static generateGUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      var r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : ((r & 0x3) | 0x8);
      return v.toString(16);
    });
  }
}

/**
 * I should create more granular types for the request and response objects and then use those
 * types in the HttpExchange type. I'm not sure if I'll ever need to do that though.
 */

type NameValuePair = {
  name: string
  value: string
}
export type HttpExchange = {
  id: string
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