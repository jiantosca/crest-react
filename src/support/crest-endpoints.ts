import { HttpRequest, HttpExchange, NameValuePair } from './http-exchange'
import { RcUtils } from './rest-client-utils'
import { Storage } from './storage'

const textPlainContent = [{name: 'content-type', value: 'text/plain'}] as NameValuePair[]
const jsonContent = [{name: 'content-type', value: 'application/json'}] as NameValuePair[]

export const handleCrestRequest = (httpRequest: HttpRequest): HttpExchange => {
    try {

        //hack to convert the crest url into something that the URL can better handle. If i don't
        //do this, the URL will think the url is relative and not parse it correctly
        const url = new URL(httpRequest.url.replace('crest://', 'http://foo.bar/'))
        const pathElements = url.pathname.split('/')
        //const key = url.searchParams.get('someQueryParameter')

        if(pathElements[1] === 'persistence') {
            console.log(`handleCrestRequest called with method ${httpRequest.method}`)
            const persistenceFunction = persistenceFunctions.get(httpRequest.method)
            const key = pathElements[2]
            
            if(key && !Storage.Keys.isSupported(key)) {
                return createExchange(httpRequest, `'${key}' is not a supported key.`, textPlainContent, 400)
            }

            const exchange = (!persistenceFunction) ? 
                createExchange(httpRequest, `Only ${Array.from(persistenceFunctions.keys()).join(', ')} methods are supported.`, textPlainContent, 405)
                :
                persistenceFunction(httpRequest, key)
            
            return exchange
        }

        return createExchange(httpRequest, `Not sure how to handle this request. URL: ${httpRequest.url} `, textPlainContent, 400);

    } catch(e) {
        console.log(e)
        return createExchange(httpRequest, `Error handling crest resource: ${e}`, textPlainContent, 500)
    }
}

const getStorage = (httpRequest: HttpRequest, storageKey: string | null): HttpExchange => {
    console.log(`getStorage called`)
    if(storageKey) {
        return createExchange(httpRequest, JSON.stringify(Storage.getItem(storageKey)))
    } else {
        const json: { [key: string]: any } = {} // Add index signature to allow indexing with a string
        Storage.Keys.listKeys().forEach(key => {
            json[key] = Storage.getItem(key);
        });
        return createExchange(httpRequest, JSON.stringify(json));
    }
}

const deleteStorage = (httpRequest: HttpRequest, storageKey: string | null): HttpExchange => {
    console.log(`deleteStorage called`)
    const jsonString = getStorage(httpRequest, storageKey).response.body
    const toBeDeletedJson = (jsonString) ? JSON.parse(jsonString) : null

    const deleted: { [key: string]: any } = { deleted: {} }

    if(storageKey) {
        deleted.deleted[storageKey] = toBeDeletedJson
    } else {
        deleted.deleted = toBeDeletedJson
    }

    if(toBeDeletedJson === null) {
        return createExchange(httpRequest, JSON.stringify(deleted))
    }

    if(storageKey) {
        Storage.removeItems([storageKey])
    } else {
        Storage.removeItems(Object.keys(toBeDeletedJson))
    }

    return createExchange(httpRequest, JSON.stringify(deleted))
}

const putStorage = (httpRequest: HttpRequest, storageKey: string | null) => {
    console.log(`putStorage called`)
    let json = bodyToJsonOrHttpExchangeError(httpRequest)
    if(json.request?.body === httpRequest.body) {
        //must be an exchange
        return json
    }
    const putResults: { [key: string]: any } = { putItems: {} }

    if(storageKey) {
        putResults.putItems[storageKey] = json
        Storage.storeItem(storageKey, JSON.stringify(json))
        return createExchange(httpRequest, JSON.stringify(putResults))
    } else {
        console.log('putStorage could use better error handling/validation');
        let keys: string[] = Object.keys(json)
        
        if(keys[0] === 'localStorage') {
            //i changed how data is stored from old cREST but want to support PUTing old data so
            //let's converte it to the new format and reinit the keys...
            json = fromLegacyStorage(json)
            keys = Object.keys(json)
            //return createExchange(httpRequest, JSON.stringify(json))
        }

        keys.forEach(key => {
            if(Storage.Keys.isSupported(key)) {
                Storage.storeItem(key, JSON.stringify(json[key]))
                putResults.putItems[key] = json[key]
            } else {
                if(!putResults.notPutItems) {
                    putResults.notPutItems = {}
                }
                putResults.notPutItems[key] = `${key} is not a supported key.`
            }
        })
        
        // i really want to make crest-endpoints more strict eventually, but for now we're being lenient which can allow room for duplications
        // being entered into storage. So for now just a bit of manual clean up which may or may not be needed depending on what was PUT.
        return createExchange(httpRequest, JSON.stringify(putResults))
    }
}

/**
 * Convert the old style cREST storage to the new style. Old storage was an array of key/values where key was
 * the local storage key, and the value is string representation of the value.
 * 
 *    {
      "name": "crest sleep 1000 expires 10 Seconds",
      "method": "POST",
      "url": "http://localhost:8080/crest-api/test/oauth.token?sleep=1000&expires=10",
      "headers": [
         "Content-Type: application/x-www-form-urlencoded"
      ],
      "body": "client_id=crest&client_secret=crestpassword&grant_type=client_credentials",
      "dateTouched": 1576884278913,
      "isOAuth": true,
   }

 * 
 * @param legacyStorage old cREST storage format
 * @returns 
 */
const fromLegacyStorage = (legacyStorage: any): any => {
    const newStorage:any = {}
    delete legacyStorage.localStorage.savedRequests
    legacyStorage.localStorage.forEach((item: any) => {
        switch (item.key) {
            case 'uriHistory':
                newStorage['urlHistory'] = JSON.parse(item.value) as string[]
                break;
            case 'headerHistory':
                newStorage[item.key] = JSON.parse(item.value) as string[]
                break;
            case 'bundles':
                const legacyBundles: any[] = JSON.parse(item.value)
                const savedRequests: HttpRequest[] = []

                legacyBundles.forEach((bundle: any) => {
                    savedRequests.push({
                        id: RcUtils.generateGUID(),
                        name: bundle.name,
                        timestamp: new Date().getTime(),
                        method: (bundle.method) ? bundle.method : 'GET',
                        url: (bundle.url) ? bundle.url : '',
                        headers: (bundle.headers) ? (bundle.headers as string[]).map(header => RcUtils.parseHeaderLine(header)) : [],
                        body: bundle.body,
                    })
                })
                newStorage['savedRequests'] = savedRequests
                break;
            case 'simpleOAuth':
                const legacyOAuths: any[] = JSON.parse(item.value)
                const oauths: HttpRequest[] = legacyOAuths.map((legacyOauth: any) => {
                    return {
                        id: legacyOauth.name,
                        name: legacyOauth.name,
                        timestamp: new Date().getTime(),
                        method: legacyOauth.method,
                        url: legacyOauth.url,
                        headers: (legacyOauth.headers as string[]).map(header => RcUtils.parseHeaderLine(header)),
                        body: legacyOauth.body,
                    }
                })
                newStorage['oauths'] = oauths
                break;
            case 'settings':
                // we're effectively ignoring the legacy settings since new ext will do some things differently
                // and have some sesnible defaults.
                newStorage['legacySettings'] = JSON.parse(item.value)
                break;
            case 'savedRequests':
                // we're effectively ignoring the legacy settings since new ext will do some things differently
                // and have some sesnible defaults.
                newStorage['legacySavedRequests'] = JSON.parse(item.value)
                break;                
            default:
                newStorage[item.key] = JSON.parse(item.value)
        }
    })
    return newStorage;
}

const bodyToJsonOrHttpExchangeError = (httpRequest: HttpRequest): any => {
    if(!httpRequest.body) {
        return createExchange(httpRequest, `${httpRequest.method}ing something to storage requires a body.`, textPlainContent, 400)
    }

    try {
        return JSON.parse(httpRequest.body)
    } catch(e) {
        return createExchange(httpRequest, `Error parsing body to JSON: ${e}`, textPlainContent, 400)
    }
}

const persistenceFunctions = new Map([
    ['GET', getStorage],
    ['PUT', putStorage],
    //['POST', postStorage],
    ['DELETE', deleteStorage]
])



const createExchange = (httpRequest: HttpRequest, body: string | null, headers?: NameValuePair[], statusCode?: number): HttpExchange => {
    return {
        timedout: false,
        aborted: false,
        request: httpRequest,
        response: {
            statusCode: (statusCode) ? statusCode : 200,
            contentLength: (body) ? body.length : 0,
            //need to ensure new instance of headers since other code can modify it
            headers: headers ? [...headers] : [...jsonContent],
            body: (body) ? body : ''
        }
    }
}