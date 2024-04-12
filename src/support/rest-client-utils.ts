import { OverridableStringUnion } from "@mui/types";
import { HttpResponse, NameValuePair } from "./http-exchange";

export class RcUtils {

  static defaultVariant: 'standard' | 'outlined' | 'filled' | undefined = 'standard' //'filled', 'outlined', 'standard'
  static defaultSize: OverridableStringUnion<'medium' | 'small'> = 'medium' //only use small/medium since not all have large
  static iconButtonSize: OverridableStringUnion<'medium' | 'small' | 'large'> = 'small' //only use small/medium since not all have large
  static defaultElevation: number = 3

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

  static parseHeaderLine(headerLine: string): NameValuePair {
    const [name, ...value] = headerLine.split(':')
    return { name: name, value: value.join(':').trim() } as NameValuePair
  }

  static isOauth(response: HttpResponse): boolean {
    try {
      return response.body && JSON.parse(response.body).access_token ? true : false
    } catch(e) {
      return false
    }
  }
}
