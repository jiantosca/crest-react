import { JSXElementConstructor, ReactElement } from "react";
import { HttpExchange, HttpExchangeHandler, HttpRequest, NameValuePair } from "./http-exchange";
import { RcUtils } from "./rest-client-utils";
import { Alert, Stack, Typography } from '@mui/material'
import { Storage } from './storage';
export class HeaderHelper {

    private headers: NameValuePair[];
    private resolvedHeaders: NameValuePair[];
    private requestId: string;
    private showDialog: (title: string, children: ReactElement<any, string | JSXElementConstructor<any>>) => void;
    private httpExchangeHandler: HttpExchangeHandler | undefined;

    /**
     * 
     * @param headers 
     * @param requestId resolving some headers require api calls (like oauth token). The id is something we use to stop long 
     * runnign requests (send buttons turns into a stop button). This only really applies when running as an ext. For now
     * i think stop won't work if not runnign as an ext.
     */
    constructor(
        headers: NameValuePair[], 
        requestId: string, 
        showDialog: (title: string, children: ReactElement<any, string | JSXElementConstructor<any>>) => void
        ) {
        
        this.headers = [...headers]//clone it so we don't ever modify the original
        this.resolvedHeaders = []
        this.requestId = requestId
        this.showDialog = showDialog
    }

    async resolveHeaders(): Promise<NameValuePair[]> {
        
        let oauthRequest: HttpRequest | undefined
        const problems: string[] = []

        this.headers.forEach((header) => {
            

            if (header.name.startsWith('crest-oauth')) {
                oauthRequest = Storage.getOAuth(header.value);
                if(!oauthRequest) {
                    problems.push(`Unable to find an oauth request named '${header.value}', check your configs.`)
                }
            } else {
                this.resolvedHeaders.push({ name: header.name, value: header.value });
            }
        });
        
        if(problems.length > 0) {
            const problemListItems = problems.map(problem => <Alert severity="error"><Typography>{problem}</Typography></Alert>)
            this.showDialog('Invalid Request', <Stack sx={{ width: '100%', pt: 1 }} spacing={2}>{problemListItems}</Stack>)            
            throw new Error('Problems resolving headers, user should have seen a dialog already');
        }
        
        

        if(oauthRequest){
            const header: NameValuePair = await this.resolveOauthHeader(oauthRequest)
            this.resolvedHeaders.push(header)
        }

        return this.resolvedHeaders
    }

    /**
     * Maybe i need a class specifically for dealing with oauth so I don't next logic so deep, but 
     * for now this'll be fine.
     */
    private resolveOauthHeader(httpRequest: HttpRequest): Promise<NameValuePair> {
        console.log("HeaderHelper.resolveOauthHeader TODO token caching and configurable timeout.");
        const oauthTimout = 30000;
        return new Promise((resolve, reject) => {

            const tokenExchangeCompletionHandler = (exchange: HttpExchange) => {
                //clear it out once we don't need it since request button comp can call getHttpExchangeHandler to
                //abort it if needed. No need to abort it if it's already done so get rid of it.
                this.httpExchangeHandler = undefined
                if (exchange.response.statusCode === 200 && exchange.response.body) {
                    try {
                        const oauthResp = JSON.parse(exchange.response.body)
                        if(!oauthResp.access_token) {
                            throw Error()
                        }
                        resolve({ name: "Authorization", value: `Bearer ${oauthResp.access_token}` })
                    } catch(error) {
                        this.showDialog('OAuth Issue',
                            <Alert severity="warning">
                                <Typography>Unable to find a token in this response: </Typography>
                                <Typography pt={2}>{exchange.response.body}</Typography>
                            </Alert>)
                        reject('Unexpected issue parsing oauth response body.')
                    }

                } else if(exchange.aborted) {
                    reject(`oauth request aborted`)
                } else if(exchange.timedout) {
                    this.showDialog('OAuth Timed out',
                    <Alert severity="warning">
                        <Typography>OAuth token retrieval timed out after {oauthTimout} milliseconds.</Typography>
                    </Alert>)
                    reject(`oauth request timed out`)
                } else {
                    console.log(JSON.stringify(exchange.response.body))
                    this.showDialog('OAuth Issue',
                    <Alert severity="warning">
                        <Typography>
                            There was an issue getting your OAuth token. The server responded with
                            a {exchange.response.statusCode}. The response body may give you a clue:
                        </Typography>
                        <Typography pt={2}>{exchange.response.body}</Typography>
                    </Alert>)
                    reject("Some unexpected error occurred resolving oauth token")                    
               }
            }

            //this id generated to be use to stop the request if needed.
            const httpRequestWithId = { ...httpRequest, id: this.requestId }

            if (RcUtils.isExtensionRuntime()) {
                console.log('HeaderHelper.resolveOauthHeader running as extension')
                chrome.runtime.sendMessage(httpRequestWithId, tokenExchangeCompletionHandler);
            } else {
                console.log('HeaderHelper.resolveOauthHeader not running as extension')
                this.httpExchangeHandler = new HttpExchangeHandler(httpRequestWithId, oauthTimout)
                console.log('HeaderHelper.resolveOauthHeader TODO this next line is for stoping when not running as an ext');
                //outerState.inFlightHttpExchangeHandler = httpExchangeHandler
                this.httpExchangeHandler.submitRequest().then(tokenExchangeCompletionHandler)
            }
        })
    }

    public getHttpExchangeHandler(): HttpExchangeHandler | undefined {
        return this.httpExchangeHandler
    }
}

