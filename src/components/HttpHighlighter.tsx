import * as React from 'react';
import { useDrawerContext } from '../support/Context';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';


import { darkModeCss, lightModeCss } from "../support/highlighter/HighlighterStyles";

export const HttpHighlighter = (
    { headersAndBody, wordWrap }: { headersAndBody: string, wordWrap: boolean }) => {

    const renderCounter  = React.useRef(0)
    console.log(`<HttpHighlighter /> rendered ${++renderCounter.current} times`)
    
    const drawerState = useDrawerContext()

    return (
        <SyntaxHighlighter 
            language='http' 
            style={drawerState.isDarkMode ? darkModeCss(wordWrap) : lightModeCss(wordWrap)}
            showLineNumbers={!wordWrap}
            wrapLongLines={wordWrap}
            // showLineNumbers={true}
            // wrapLongLines={false}
            //showInlineLineNumbers={true}
        >
            {/* https://www.dhiwise.com/post/crafting-beautiful-code-blocks-with-react-syntax-highlighter */}
            {headersAndBody}
        </SyntaxHighlighter>
    )
}
//overflow-x: hidden;
/**
 * To enable word wrap
 *   - showLineNumbers={false} - on <SyntaxHighlighter>
 *   - wrapLongLines={true} - on <SyntaxHighlighter>
 *   - "overflow": "hidden", in CSS for "pre[class*=\"language-\"]": {
 *         - this gets rid of flashing horizontal scroll on resize of window.
*   - "wordWrap": "break-word" in CSS for "code[class*=\"language-\"]"
 * 
 * to disable word wrap
 *   - showLineNumbers={true} - on <SyntaxHighlighter>
 *   - wrapLongLines={false} - on <SyntaxHighlighter>
 *   - "overflow": "auto", in CSS for "pre[class*=\"language-\"]": {
 *   - "wordWrap": "inherit", in CSS for "code" element... maybe exclude it somehow or "normal" seems to work too. 

 */