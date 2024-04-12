//const chromeStorage = (chrome.storage) ? true : false;

import { HttpRequest } from "./http-exchange"
import { AppSettings, SettingsType } from "./settings"

/**
 * this class is cable of storing data chrome.storage.local when available, otherwise
 * it will use localStorage. This is handy when running the code as an extension
 * vs a web page (like via npm run start)
 */
export class Storage {
    static Keys = {
        urlHistory: 'urlHistory',
        headerHistory: 'headerHistory',
        requestHistory: 'requestHistory',
        oauths: 'oauths', 
        savedRequests: 'savedRequests',
        settings: 'settings',
        listKeys: () => {
            const keys: string[] = Object.values(Storage.Keys).filter(
                value => typeof value === 'string') as string[]
            return keys
        },
        isSupported: (key: string) => {
            return Storage.Keys.listKeys().includes(key)
        }
    }

    static listUrls(): string[] {
        const urls = localStorage.getItem(Storage.Keys.urlHistory)
        return urls ? JSON.parse(urls) : []
    }

    static storeUrl(url: string): void {
        this.storeUrls([url]);
    }

    static isHttpOrHttps(url: string): boolean {
        return url.startsWith('http://') || url.startsWith('https://')
    }

    static storeUrls(newUrls: string[]): void {
        newUrls = newUrls.filter(url => Storage.isHttpOrHttps(url))
        if(newUrls.length < 1) {
            return;
        }
        const historyUrls = Storage.listUrls();
        Storage.mergeAndStore(Storage.Keys.urlHistory, historyUrls, newUrls)
    }

    static listHeaders(): string[] {
        const headers = localStorage.getItem(Storage.Keys.headerHistory)
        return headers ? JSON.parse(headers) : [];
    }

    static storeHeaders(newHeaders: string[]): void {
        const excludes = ['-timestamp', '-digest', '-guid', 'authorization', 'crest-']
        newHeaders = newHeaders.filter(header => 
            !excludes.some(exclude => header.toLowerCase().includes(exclude))
        )
        const historyHeaders = Storage.listHeaders()
        Storage.mergeAndStore(Storage.Keys.headerHistory, historyHeaders, newHeaders)
    }

    static getOAuth(name: string): HttpRequest | undefined {
        const oauths = Storage.listOAuths()
        return oauths.find(oauth => oauth.name === name)
    }

    static listOAuths(): HttpRequest[] {
        const oauths = localStorage.getItem(Storage.Keys.oauths)
        return oauths ? JSON.parse(oauths) : []
    }
    
    static storeOAuths(oauths: HttpRequest[]): void {
        localStorage.setItem(Storage.Keys.oauths, JSON.stringify(oauths));
    }
    
    static listHttpRequests(): HttpRequest[] {
        const bundles = localStorage.getItem(Storage.Keys.savedRequests);
        return bundles ? JSON.parse(bundles) : [];
    }
    
    static getHttpRequest(name: string): HttpRequest | undefined {
        const bundles = Storage.listHttpRequests();
        return bundles.find(request => request.name === name)
    }

    static storeHttpRequests(httpRequests: HttpRequest[]): void {
        localStorage.setItem(Storage.Keys.savedRequests, JSON.stringify(httpRequests));
    }

    static listRequestHistory(): HttpRequest[] {
        const requestHistory = localStorage.getItem(Storage.Keys.requestHistory);
        return requestHistory ? JSON.parse(requestHistory) : []
    }

    static updateRequestHistory(httpRequest: HttpRequest): void {
        if(!Storage.isHttpOrHttps(httpRequest.url)) {
            return;
        }
        const requestHistory = Storage.listRequestHistory()
        requestHistory.unshift(httpRequest)
        const limit = AppSettings.get().historyLimit
        if (requestHistory.length > limit) {
            requestHistory.splice(limit)
        }
        localStorage.setItem(Storage.Keys.requestHistory, JSON.stringify(requestHistory))
    }

    static storeRequestHistory(requestHistory: HttpRequest[]): void {
        localStorage.setItem(Storage.Keys.requestHistory, JSON.stringify(requestHistory));
    }

    static getSettings(): SettingsType | null {
        const settings = localStorage.getItem(Storage.Keys.settings);
        return settings ? JSON.parse(settings) : null;
    }

    static storeSettings(settings: SettingsType): void {
        localStorage.setItem(Storage.Keys.settings, JSON.stringify(settings));
    }

    /**
     * This should really only be used by the crest://persistence endpoints.
     * 
     * @param key local storage key
     * @returns 
     */
    static getItem(key: string): string | null {
        const item = localStorage.getItem(key);
        return (item) ? JSON.parse(item) : null;
    }
    
    /**
     * This endpoint can really mess up local storage since it'll store any string for any key. For now
     * I did this to support the crest://persistence endpoints to store data more dynamically but I should
     * revisit this and do things much more safely. People generally will never use this unless they're porting
     * data from an old cREST version. During normal use of the ext, when it needs to save a url, or header,
     * oauth, etc... it'll use the strongly typeed methods above.
     * 
     * @param key 
     * @param value 
     */
    static storeItem(key: string, value: string): void {
        localStorage.setItem(key, value)
    }

    static removeItems(keys: string[]): void {
        keys.forEach(key => localStorage.removeItem(key))
    }

    static clearAll(): void {
        localStorage.clear();
    }
    
    static listPersistenceUrls() {
        const base = 'crest://persistence'
        const urls = [base]
        Storage.Keys.listKeys().forEach(key => {
            urls.push(`${base}/${key}`)
        })
        return urls
    }
    
    /**
     * Merge values from the new string[] into the existing string[].
     */
    private static mergeAndStore(key: string, existing: string[], newItems: string[]): void {
        const beforeLength = existing.length;

        newItems.forEach(newItem => {
            if (!existing.includes(newItem)) {
                existing.push(newItem)
            }
        })

        existing.sort();

        if (beforeLength !== existing.length) {
            console.log(`storing history for key ${key}`)
            localStorage.setItem(key, JSON.stringify(existing))
        } else {
            console.log(`not storing history for key ${key} because nothing changed`)
        }
    }

    isArrayOfStrings = (anArray: any) => {
        if (!Array.isArray(anArray)) {
            return false;
        }

        for (let i = 0; i < anArray.length; i++) {
            if (typeof anArray[i] !== 'string') {
                return false;
            }
        }

        return true;
    }
}

