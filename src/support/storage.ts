//const chromeStorage = (chrome.storage) ? true : false;

/**
 * this class is cable of storing data chrome.storage.local when available, otherwise
 * it will use localStorage. This is handy when running the code as an extension
 * vs a web page (like via npm run start)
 */
export class Storage {
    static urlHistoryKey: string = 'urlHistory'
    static headerHistoryKey: string = 'headerHistory'

    static listUrls(): string[] {
        const urls = localStorage.getItem(Storage.urlHistoryKey);
        return urls ? JSON.parse(urls) : [];
    }

    static storeUrl(url: string): void {
        this.storeUrls([url]);
    }

    static storeUrls(newUrls: string[]): void {
        const historyUrls = Storage.listUrls();
        Storage.mergeAndStore(Storage.urlHistoryKey, historyUrls, newUrls)
    }

    static listHeaders(): string[] {
        const headers = localStorage.getItem(Storage.headerHistoryKey);
        return headers ? JSON.parse(headers) : [];
    }

    static storeHeaders(newHeaders: string[]): void {
        const historyHeaders = Storage.listHeaders();
        Storage.mergeAndStore(Storage.headerHistoryKey, historyHeaders, newHeaders)
    }

    /**
     * Merge values from the new items into the existing and return a boolean indicating if 
     * the existing array was changed.
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
            localStorage.setItem(key, JSON.stringify(existing));
        } else {
            console.log(`not storing history for key ${key}`)
        }
    }

    /**
     * The big comment below was my attemp to use the chrome.storage.local api or localStorage depending if the code was running as an 
     * extension or a web page. The chrome.storage.local api is async and the localStorage api is sync, so in order to support both 
     * I had to wrap the localStoreage api in a promise so it looks/feels like chrome.storage.local. Now the main problem is that it's
     * async which is a headache for things like the Autocomplete component for url input and headers which needs to be able to pull
     * values synchronously. 
     * 
     * I could probably implement some kind of cache of url and headers, and add listeners to update it when storage changes, but for now
     * I'm just going to use localStorage and not worry about it.
     */
    // static set(key: string, value: any): Promise<void> {
    //     return new Promise((resolve, reject) => {
    //         if (chromeStorage) {
    //             chrome.storage.local.set({ [key]: value }, () => {
    //                 if (chrome.runtime.lastError) {
    //                     reject(chrome.runtime.lastError);
    //                 } else {
    //                     resolve();
    //                 }
    //             });
    //         } else {
    //             try {
    //                 localStorage.setItem(key, JSON.stringify(value));
    //                 resolve();
    //             } catch (error) {
    //                 reject(error);
    //             }
    //         }
    //     });
    // }

    // static get(key: string): Promise<any> {
    //     return new Promise((resolve, reject) => {
    //         if (chromeStorage) {
    //             chrome.storage.local.get(key, (result: any) => {
    //                 if (chrome.runtime.lastError) {
    //                     reject(chrome.runtime.lastError);
    //                 } else {
    //                     resolve(result[key]);
    //                 }
    //             });
    //         } else {
    //             try {
    //                 const value = localStorage.getItem(key);
    //                 resolve(value ? JSON.parse(value) : null);
    //             } catch (error) {
    //                 reject(error);
    //             }
    //         }
    //     });
    // }

    // static delete(key: string): Promise<void> {
    //     return new Promise((resolve, reject) => {
    //         if (chromeStorage) {
    //             chrome.storage.local.remove(key, () => {
    //                 if (chrome.runtime.lastError) {
    //                     reject(chrome.runtime.lastError);
    //                 } else {
    //                     resolve();
    //                 }
    //             });
    //         } else {
    //             try {
    //                 localStorage.removeItem(key);
    //                 resolve();
    //             } catch (error) {
    //                 reject(error);
    //             }
    //         }
    //     });
    // }
}

