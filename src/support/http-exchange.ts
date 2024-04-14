export type NameValuePair = {
    name: string
    value: string
}

export type HttpRequest = {
    id: string
    name: string
    isOAuth?: boolean
    timestamp?: number
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

    constructor(httpRequest: HttpRequest, timeout?: number) {
        console.log('HttpExchangeHandler constructor')
        this.httpRequest = httpRequest
        this.abortController = new AbortController()
        this.timeout = (timeout) ? timeout : this.timeout
    }

    /**
     * @deprecated see submitRequest
     */
    private _submitRequest(completionHandler: (exchange: HttpExchange) => void): void {
        console.log('HttpExchangeHandler.sendRequest NO COOKIE handling yet.')

        const timeoutId = (this.timeout > 0) ? setTimeout(() => {
            this.timedout = true
            this.abortController.abort()
        }, this.timeout) : undefined

        const headers = new Headers()
        this.httpRequest.headers.forEach(header => {
            headers.append(header.name, header.value)
        })

        fetch(this.httpRequest.url, {
            method: this.httpRequest.method,
            headers: headers,
            cache: 'no-cache',
            body: this.httpRequest.body,
            signal: this.abortController.signal
        }).then(async response => {
            this.httpExchange = this.createHttpExchange(response, await response.text())
        }).catch((error) => {
            console.error('HttpExchangeHandler.sendRequest caught an error', error)
            this.httpExchange = this.createHttpExchange()
        }).finally(() => {
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
}