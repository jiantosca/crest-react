import { FilterOptionsState } from '@mui/material'
import { OverridableStringUnion } from "@mui/types";
import { Storage } from "./Storage";
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

    const suggestions = Storage.listUrls().filter((url) => tokens.every(token => url.includes(token)))

    // console.log({ tokens })
    // console.log(state)

    return suggestions
  }

  /**
   * Sometimes i run the app as an extension and sometimes as a web page and some parts of the
   * code need to know which one it is. This method returns true if running as an extension.
   * 
   * @returns true if running as an extension
   */
  static isExtensionRuntime(): boolean {
    return (window.chrome && chrome.runtime && chrome.runtime.id) ? true : false
  }
  
  // static equalsIgnoreCase(s1: string, s2: string): boolean{
  //   return s1.localeCompare(s2, undefined, { sensitivity: 'base' }) === 0;
  // }

  static generateGUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      var r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : ((r & 0x3) | 0x8);
      return v.toString(16);
    });
  }
}