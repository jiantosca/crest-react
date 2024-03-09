import {HttpExchange, HttpRequest, NameValuePair} from './type.http-exchange'

export class HttpExchangeHandler {

    timedout: boolean = false
    aborted: boolean = false
    startTime: number | undefined
    endTime: number | undefined
    httpExchange: HttpExchange | undefined
    httpRequest: HttpRequest
    
    constructor(httpRequest: HttpRequest) {
        console.log('HttpExchangeHandler constructor')
        this.httpRequest = httpRequest
    }

    submitRequest(completionHandler: (exchange: HttpExchange) => void): void {
        console.log('HttpExchangeHandler sendRequest NO COOKIE handling yet.')
        console.log('HttpExchangeHandler sendRequest NO ABORT handling yet.')

        const headers = new Headers()
        this.httpRequest.headers.forEach(header => {
            headers.append(header.name, header.value)
        })

        fetch(this.httpRequest.url, { 
            method: this.httpRequest.method,
            headers: headers,
            cache: 'no-cache',
            body: this.httpRequest.body,
            //signal: this.abortController.signal
        }).then(async response => {
            this.httpExchange = this.createCompletionState(this.httpRequest, response, await response.text())
        }).catch((error) => {
            console.error('catch:', error);
        }).finally(() => {
            if (!this.httpExchange) {
                console.error('HttpExchangeHandler.sendRequest finished an undefined httpExchange. This should ' + 
                    'never happen and indicates we have a bug to fix. Here\'s the request');
                console.error(this.httpRequest)
    
                this.httpExchange = {
                    timedout: this.timedout,
                    aborted: this.aborted,
                    request: this.httpRequest,
                    response: {
                        statusCode: 0,
                        headers: [],
                    }
                }
            }
            completionHandler(this.httpExchange)
        });
    }


    private createCompletionState(httpRequest: HttpRequest, response: Response | undefined, responseBody: string): HttpExchange {
        let responseHeaders: NameValuePair[] = (response) ? 
            Array.from(response.headers.entries()).map(entry => {
                return {name: entry[0], value: entry[1]}
            }) : []
        
        let statusCode: number = (response) ? response.status : 0

        return {
            timedout: this.timedout,
            aborted: this.aborted,
            startTime: this.startTime,
            endTime: this.endTime,
            request: httpRequest,
            response: {
                statusCode: statusCode,
                headers: responseHeaders,
                body: responseBody
            },
        }
    }
}

export function tester(): void {
    const exchange: HttpExchange = {
        timedout: false,
        aborted: false,
        request: {
            id: 'some-id',
            method: 'GET',
            url: 'https://jsonplaceholder.typicode.com/comments/1',
            headers: [
            ]
        },
        response: {
            statusCode: 200,
            headers: [
                {name: 'Content-Type', value: 'application/json'},
            ]
        }
    }
    console.log('tester rest-client new structure HttpExchangeHandler')
    console.log('tester rest-client new structure HttpExchangeHandler')
    console.log('tester rest-client new structure HttpExchangeHandler')
    console.log('tester rest-client new structure HttpExchangeHandler')
    console.log(exchange)
}