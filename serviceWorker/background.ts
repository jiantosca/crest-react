/* eslint-disable no-restricted-globals */
/* global chrome */

/**
 * I can't seem to compile this along side all the other react stuff because things get packed
 * up and bublded into single js files and I can't refer to this file in the manifest.json for
 * the plugin. So i give it it's own folder and build it separately via package.json 
 * build script update. 
 * 
 * Also, if imports are used that pull from main src dir, then the build dir will contain
 * this files dir with this file in it, then it will create the imported dir so it will 
 * will be propertly imported. If no import, then this file will be directly in the build dir. 
 * this call matter cause it changes how you specifty the path of this file in the manifest.json.
 */
import { HttpExchangeHandler } from '../src/support/http-exchange.js'

function getExtUrl(ext: chrome.management.ExtensionInfo) {
	console.log('getExtUrl with ext:', ext)
	console.log('getExtUrl with chrome:', chrome)

	let theUrl = 'chrome-extension://' + location.host + '/index.html';

	if (ext.installType === 'development') {
		theUrl += '?installType=development';
	}

	return theUrl;
}
//active tab is whatever tab is active when you click Rest Client. could be web page or whatever.
chrome.action.onClicked.addListener((activeTab) => {
	chrome.management.get(chrome.runtime.id, (ext) => {
		chrome.tabs.create({
			url: getExtUrl(ext)
		}
		)
	})
})


/**
 * The activeExchangeHandlers map help us keep track of inflight requests so we can abort them if the user 
 * clicks the stop button. It's highly unlikely that there would be more than one in here at a time, but
 * it's possible if users have multiple tabs of the extension open and are sending requests from each tab 
 * at the same time. For this reason we use a map.
 */
let activeExchangeHandlers = new Map<string, HttpExchangeHandler>();

/**
 * This is the main message handler for the extension. It takes care of submitting http requests and constructed
 * by the user in the <RequestBuilder /> component. It also handles aborting requests if the user clicks the stop.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	console.log('chrome.runtime.onMessage.addListener request:', request)
	console.log(`background.ts.onMessage has ${activeExchangeHandlers.size} activeExchangeHandlers:`, activeExchangeHandlers)
	if (request.url) {
		console.log('background.ts.onMessage handling new http request')
		const exchangeHandler = new HttpExchangeHandler(request, true)
		activeExchangeHandlers.set(request.id, exchangeHandler)
		exchangeHandler.submitRequest().then((exchange) => {
			activeExchangeHandlers.delete(request.id)
			console.log('background.ts.onMessage completionHandler sending HttpExchange back: ', exchange)
			sendResponse(exchange)
		})

		//return true to ensure comm ports remain open so sendResponse works after this method returns.
		return true

	} else if (request.abortId) {
		console.log(`background.ts.onMessage handling abort request for id: ${request.abortId}`)
		const exchangeHandler = activeExchangeHandlers.get(request.abortId)
		if (exchangeHandler) {
			exchangeHandler.abort()
			activeExchangeHandlers.delete(request.abortId)
		}
	} else {
		console.error('background.tx.onMessage received a message it doesn\'t know how to handle. request object:', request)
	}




});

export { } //make it a module so eslint doesn't complain about no exports