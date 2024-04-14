import { OverridableStringUnion } from "@mui/types";
import { HttpExchange, HttpRequest, HttpResponse, NameValuePair } from "./http-exchange";
import { Application } from "./react-contexts";
import { Stack, Typography, Alert, Button } from '@mui/material'

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
    } catch (e) {
      return false
    }
  }

  static showNoStatusCodeDialog(httpExchange: HttpExchange, app: Application): void {
    if (httpExchange.aborted) {
      return
    } else if (httpExchange.timedout) {
      app.showDialog('Timed Out',
        <Alert severity='warning'>
          <Typography component='div'>The request timed out after {httpExchange.timeout} milliseconds.</Typography>
        </Alert>)
    } else {
      app.showDialog('Network Error',
        <Alert severity="error">
          {/* component='div' so each typography is on a new line */}
          <Typography component="div">No response from the server. Ensure your URL is correct.</Typography>
          {httpExchange.request.url.startsWith('https') && <Typography component="div" pt={1}>This could also be due to SSL issues. You could add an exception in chrome if appropriate.</Typography>}
        </Alert>)
    }
  }

  static isHttpRequestsEqual(request1: HttpRequest, request2: HttpRequest): boolean {
    if (request1.url === request2.url &&
      request1.method === request2.method &&
      request1.body === request2.body &&
      request1.unresolvedHeaders.length === request2.unresolvedHeaders.length) {
        
        //we know most stuff is the same at this point, now let's check header name/values all match
        const headersMap1: Map<string, string> = request1.unresolvedHeaders.reduce((map, header) => {
          map.set(header.name, header.value)
          return map;
        }, new Map<string, string>());

        request2.unresolvedHeaders.forEach(header => {
          if (headersMap1.get(header.name) !== header.value) {
            return false
          }
        })
        return true
    }    
    return false
  }
}
