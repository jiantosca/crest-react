/* eslint-disable no-restricted-globals */
/* global chrome */

/**
 * I can't see to compile this along side all the other react stuff because things get packed
 * up and bublded into single js files and I can't refer to this file in the manifest.json for
 * the plugin. So i give it it's own folder and build it separately via package.json 
 * build script update. 
 * 
 * Also, if imports are used that pull from main src dir, then the build dir will contain
 * this files dir with this file in it, then it will create the imported dir so it will 
 * will be propertly imported. If no import, then this file will be directly in the build dir. 
 * this call matter cause it changes how you specifty the path of this file in the manifest.json.
 */
import {HttpExchangeHandler} from '../src/support/http-exchange-handler.js'

function getExtUrl(ext: chrome.management.ExtensionInfo) {
	console.log({ chrome })
	console.log(location)
	console.log(location.host)
	let theUrl = 'chrome-extension://' + location.host + '/index.html';

	if (ext.installType === 'development') {
		theUrl += '?installType=development';
	}

	return theUrl;
}
//active tab is whatever tab is active when you click Rest Client. could be web page or whatever.
chrome.action.onClicked.addListener( (activeTab) => {
	chrome.management.get(chrome.runtime.id, (ext) => {
		console.log('chrome.management.get new')
		console.log('chrome.management.get new')
		console.log('chrome.management.get new')
		console.log('chrome.management.get new')
		chrome.tabs.create({
			url: getExtUrl(ext)
		}
		);
	});
});

/**
 * request - the message sent by the sender, HttpRequest in my case. 
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	console.log('chrome.runtime.onMessage.addListener')
	console.log(request)
	console.log(sender)
	console.log(sendResponse)
	const exchangeHandler = new HttpExchangeHandler(request)
	exchangeHandler.submitRequest((exchange) => {
		console.log('******* chrome.runtime.onMessage.addListener completionHandler sending response back to sender')
		console.log(exchange)
		sendResponse(exchange)
	});
	return true;//ensures comm ports remain open so sendResponse works after this method returns.

});

export { } //make it a module so ts doesn't complain about no exports