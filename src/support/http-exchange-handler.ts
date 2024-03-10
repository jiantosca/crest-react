import { HttpExchange, HttpRequest, NameValuePair } from './type.http-exchange'

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

    submitRequest(completionHandler: (exchange: HttpExchange) => void): void {
        console.log('HttpExchangeHandler.sendRequest NO COOKIE handling yet.')

        console.log(this.timeout)

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

    abort() {
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
        let responseHeaders: NameValuePair[] = (response) ?
            Array.from(response.headers.entries()).map(entry => {
                return { name: entry[0], value: entry[1] }
            }) : []

        let statusCode: number = (response) ? response.status : 0
        
        return {
            timedout: this.timedout,
            timeout: this.timeout,
            aborted: this.aborted,
            startTime: this.startTime,
            endTime: this.endTime,
            request: this.httpRequest,
            response: {
                statusCode: statusCode,
                headers: responseHeaders,
                body: responseBody
            },
        }
    }
}