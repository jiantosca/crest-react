import * as React from 'react';
import { useApplicationContext } from '../support/react-contexts';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { HttpResponse, HttpRequest, NameValuePair } from '../support/http-exchange';
import { darkModeCss, lightModeCss } from "../support/highlighter-styles";
import { parse, stringify } from 'lossless-json';
import { AppSettings } from '../support/settings';


export const HttpHighlighter = (
    { requestOrResponse, wordWrap }: { requestOrResponse: HttpRequest | HttpResponse, wordWrap: boolean }) => {

    const renderCounter = React.useRef(0)
    console.log(`<HttpHighlighter /> rendered ${++renderCounter.current} times`)
    let body = requestOrResponse.body || ''
    // when false we never show line numbers or highlight the response. Both of inject tons of stuff into the dom
    // making some thing sluggish. TODO i was using contentLength on HttpResponse to determine if we should pretty print
    // but can prolly remove that now that I'm using Blob.size to support HttpRequest in addition to HttpResponse now
    const highlight = new Blob([body]).size < AppSettings.getPrettyPrintBytesLimit()

    body = prettyPrint(body, requestOrResponse.headers)

    let headersAndBody: string =
    requestOrResponse.headers.map(
            header => `${header.name}: ${header.value}\n`)
            .join('')

    if (body) {
        headersAndBody += '\n' + body;
    }

    const drawerState = useApplicationContext()

    return (
        <SyntaxHighlighter
            language={(highlight) ? 'http': 'none'}
            style={drawerState.isDarkMode ? darkModeCss(wordWrap) : lightModeCss(wordWrap)}
            showLineNumbers={highlight && !wordWrap}
            wrapLongLines={wordWrap}
        >
            {/* https://www.dhiwise.com/post/crafting-beautiful-code-blocks-with-react-syntax-highlighter */}
            {headersAndBody}
        </SyntaxHighlighter>
    )
}

const jsonMediaReg = /[/|+]json/
const xmlMediaReg = /[/|+]xml/

function prettyPrint(body: string, headers: NameValuePair[]): string {

    body = body.trim();

    if (!body && body.indexOf('\n') !== -1) {//&& settings.prettyPrint
        return body;
    }

    const contentType = headers.find(header => header.name.trim().toLowerCase().startsWith('content-type'))?.value

    if (contentType) {
        if (jsonMediaReg.test(contentType)) {
            try {
                body = stringify(parse(body), null, 3) || body
            } catch (error: any) { // Change the type annotation of 'error' to 'any'
                headers.push({ name: 'rest-client-response-note', value: 'Content-Type is json, but I can\'t parse it. See console logs' })
                console.error(`JSON Error, Here's a hint: \n\n    ${error}\n${error.stack}`);
            }
        } else if (xmlMediaReg.test(contentType)) {
            body = formatXml(body)
        }
    }

    return body
}

/**
 * This'll pretty print the xml. I grabbed this code from..
 * 
 * http://stackoverflow.com/questions/376373/pretty-printing-xml-with-javascript
 * 
 * Posted by "Dan BROOKS". 
 * 
 * Jon I - Updated Luca's regex to support processing instructions in addition to 
 * xml declarations, and adjusted the code so it'll include proper indent. 
 * 
 * 
 * @param xml
 * @returns {String}
 */
function formatXml(xml: string) {
    var reg = /(>)\s*(<)(\/*)/g; // updated Mar 30, 2015
    var wsexp = / *(.*) +\n/g;
    var contexp = /(<.+>)(.+\n)/g;
    xml = xml.replace(reg, '$1\n$2$3').replace(wsexp, '$1\n').replace(contexp, '$1\n$2');
    var formatted = '';
    var lines = xml.split('\n');
    var indent = 0;
    var lastType = 'other';
    // 4 types of tags - single, closing, opening, other (text, doctype, comment) - 4*4 = 16 transitions 
    var transitions = {
        'single->single': 0,
        'single->closing': -1,
        'single->opening': 0,
        'single->other': 0,
        'closing->single': 0,
        'closing->closing': -1,
        'closing->opening': 0,
        'closing->other': 0,
        'opening->single': 1,
        'opening->closing': 0,
        'opening->opening': 1,
        'opening->other': 1,
        'other->single': 0,
        'other->closing': -1,
        'other->opening': 0,
        'other->other': 0
    } as any;

    for (var i = 0; i < lines.length; i++) {
        var ln = lines[i];

        var single = Boolean(ln.match(/<.+\/>/)); // is this line a single tag? ex. <br />
        var closing = Boolean(ln.match(/<\/.+>/)); // is this a closing tag? ex. </a>
        var opening = Boolean(ln.match(/<[^!].*>/)); // is this even a tag (that's not <!something>)
        var type = single ? 'single' : closing ? 'closing' : opening ? 'opening' : 'other';
        var fromTo = lastType + '->' + type;
        lastType = type;
        var padding = '';

        indent += transitions[fromTo];
        for (var j = 0; j < indent; j++) {
            padding += '\t';
        }

        // Luca Viggiani 2017-07-03: handle optional <?xml ... ?> declaration
        // Jon I 2019-07-28: want padding and support for both xml declaration and processing instructions.
        if (ln.match(/\s*<\?/)) {
            formatted += padding + ln + '\n';
            //now that we got padding let's undo some vars so next element is treated like this was.
            indent -= transitions[fromTo];

            lastType = fromTo.split('->')[0];//pust 'lastType' back to what it was
            continue;
        }
        // ---

        if (fromTo === 'opening->closing') {
            // JPI original code used deprecated substr so I changed to substring
            //formatted = formatted.substr(0, formatted.length - 1) + ln + '\n'; // substr removes line break (\n) from prev loop
            formatted = formatted.substring(0, formatted.length - 1) + ln + '\n'
        } else {
            formatted += padding + ln + '\n';
        }
    }

    return formatted;
}