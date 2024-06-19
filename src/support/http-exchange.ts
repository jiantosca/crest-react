export type NameValuePair = {
    name: string
    value: string
}

export type HttpRequest = {
    id: string
    name: string
    isOAuth?: boolean
    timestamp?: number
    timeout?: number,
    method: string
    url: string
    headers: NameValuePair[]
    unresolvedHeaders: NameValuePair[]
    body?: string
}

export type HttpResponse = {
    statusCode: number
    headers: NameValuePair[]
    body?: string
}

export type HttpExchange = {
    timedout: boolean
    timeout?: number
    aborted: boolean
    startTime?: number
    endTime?: number
    request: HttpRequest
    response: HttpResponse
}

export class HttpExchangeHandler {

    timedout: boolean = false
    timeout: number = 60000
    aborted: boolean = false
    abortController: AbortController
    startTime: number | undefined
    endTime: number | undefined
    httpExchange: HttpExchange | undefined
    httpRequest: HttpRequest
    isExtensionRuntime: boolean
    chromeCookieNames: string[]

    constructor(httpRequest: HttpRequest, isExtensionRuntime: boolean) {
        console.log('HttpExchangeHandler constructor')
        this.isExtensionRuntime = isExtensionRuntime
        this.httpRequest = httpRequest
        this.abortController = new AbortController()
        this.timeout = (httpRequest.timeout) ? httpRequest.timeout : this.timeout
        this.chromeCookieNames = []
    }

    /**
     * @deprecated see submitRequest
     */
    private _submitRequest(completionHandler: (exchange: HttpExchange) => void): void {
        const timeoutId = (this.timeout > 0) ? setTimeout(() => {
            this.timedout = true
            this.abortController.abort()
        }, this.timeout) : undefined

        const headers = new Headers()
        this.httpRequest.headers.forEach(header => {
            // cookies are just headers, but in chrome it's not that simple. When running as an extension, we need to use the chrome.cookies api
            // to set the cookies. When running as a web app we won't support cookie headers from the request building. But, if you some other
            // tab has a cookie for the domain cREST is making request too, chrome will include them in the request. 
            if(this.isExtensionRuntime && header.name.toLowerCase() === 'cookie') {
                this.handleChromeCookies(header);
            } else {
                headers.append(header.name, header.value)
            }
        })

        let fetchOptions: RequestInit = {
            method: this.httpRequest.method,
            headers: headers,
            cache: 'no-cache',
            body: this.httpRequest.body,
            signal: this.abortController.signal
        }
        
        // when not running as extension, we need to 'include' credentials option for cookies to work with cors request which we do
        // When running as an extension, we don't need to include credentials as the extension is not subject to cors and
        // cookies are included by default when applicable (i.e. cookie set for domain that ext making req to)
        fetchOptions = !this.isExtensionRuntime ? { ...fetchOptions, credentials: 'include' } : fetchOptions

        console.log(fetchOptions)

        fetch(this.httpRequest.url, fetchOptions).then(async response => {
            this.httpExchange = this.createHttpExchange(response, await response.text())
        }).catch((error) => {
            console.error('HttpExchangeHandler.sendRequest caught an error', error)
            this.httpExchange = this.createHttpExchange()
        }).finally(() => {
            if(this.isExtensionRuntime && this.chromeCookieNames.length > 0) {
                this.removeChromeCookies()
            }

            if (!this.httpExchange) {
                console.error('HttpExchangeHandler.sendRequest finished an undefined httpExchange. This should ' +
                    'never happen and indicates we have a bug to fix. Here\'s the request');
                console.error(this.httpRequest)
                this.httpExchange = this.createHttpExchange()
            }

            if (timeoutId) {
                clearTimeout(timeoutId)
            }
            completionHandler(this.httpExchange)
        });
    }

    /**
     * I originally wrote submitRequest(callback), and then realized i'll need a promise I can await on in some cases (oauth).
     * So for now just renamed original call back to _submitRequest and added this submitRequest method belowthat returns a 
     * promise.
     * 
     * The returned promise will ALWAYS return an HttpExchange object no matter what, so client code need only implement the
     * '.then()' method and not worry about catching errors.
     */
    submitRequest(): Promise<HttpExchange> {
        console.log('HttpExchangeHandler.submitRequest(): Promise<HttpExchange>')

        return new Promise<HttpExchange>((resolve, reject) => {
           this._submitRequest((httpExchange) => {
               resolve(httpExchange)
           })
        });
    }

    abort() {
        console.log(`HttpExchangeHandler.abort() for url ${this.httpRequest.url}` )
        this.aborted = true
        this.abortController.abort()
    }
    /**
     * Creates an HttpExchange object from the request and optional response and response body. Requests that 
     * have been aborted by the user, or timed out will not have response or responseBody.
     * 
     * @param response 
     * @param responseBody 
     * @returns 
     */
    private createHttpExchange(response?: Response, responseBody?: string): HttpExchange {
        let contentTypeWithMineParam: NameValuePair | undefined

        const responseHeaders: NameValuePair[] = (response) ?
            Array.from(response.headers.entries()).map(entry => {
                if (entry[0].toLowerCase() === 'content-type' && entry[1].includes(';')) {
                    contentTypeWithMineParam = { name: entry[0], value: entry[1] }
                    return { name: entry[0], value: entry[1].split(';')[0] } // remove mine param since there's a bug in prism js :(. Hope they fix it soon.
                }
                return { name: entry[0], value: entry[1] }
            }) : []

        if (contentTypeWithMineParam) {
            responseHeaders.push({ ...contentTypeWithMineParam, name: `${contentTypeWithMineParam.name}-original`})
        }

        const statusCode: number = (response) ? response.status : 0
        
        return {
            timedout: this.timedout,
            timeout: this.timeout,
            aborted: this.aborted,
            startTime: this.startTime, //TODO not set/used yet
            endTime: this.endTime, //TODO not set/used yet
            request: this.httpRequest,
            response: {
                statusCode: statusCode,
                headers: responseHeaders,
                body: responseBody
            },
        }
    }

    
    private handleChromeCookies(cookieHeader: NameValuePair) {
        let pairs = cookieHeader.value.split(';')
        pairs.forEach(pair => {
            let [cookieName, ...cookieValues] = pair.split('=')//possible that value has = in it so keep in ...values array
            cookieName = cookieName.trim()
            const cookieValue = cookieValues.join('=').trim()
    
            // Validate the cookie name
            if (!cookieName || /[\s;=,]/.test(cookieName) || !cookieValue) {
                console.warn(`Can't deal with name/value pair for this cookie: "'${pair}'". Check the format`)
                return
            }
            console.log(`Adding cookie to chrome: ${cookieName} = ${cookieValue}`)
            this.chromeCookieNames.push(cookieName);//used to remove when request is finished
            chrome.cookies.set({ url: this.httpRequest.url, name: cookieName, value: cookieValue })
        })
    }

    private removeChromeCookies() {
        this.chromeCookieNames.forEach(cookieName => {
            console.log(`Removing chrom cookie named '${cookieName}'`);
            chrome.cookies.remove({ url: this.httpRequest.url, name: cookieName })
        });
    }               
}