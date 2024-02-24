import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import * as React from 'react';

// playing with out of the box <SyntaxHighlighter> comp styles.
import { solarizedlight, a11yDark, oneDark, twilight, materialDark, materialLight, vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
// my custom ones.
import { darkMode, darkModeVsPlus, lightMode } from "../support/highlighter/HighlighterStyles";

export const HttpHighlighter = ({headersAndBody}: {headersAndBody: string}) => {
    const renderCounter  = React.useRef(0)
    console.log(`<HttpHighlighter /> rendered ${++renderCounter.current} times`)

     const json = {
        "sldkjf":  1,
        "two" : "three"
     }
    return (
        <SyntaxHighlighter 
            language='http' 
            style={darkModeVsPlus}
            showLineNumbers={true}
            wrapLongLines={false}
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
 *   - "wordWrap": "break-word" in CSS for "code[class*=\"language-\"]"
 *   - "overflow": "hidden", in CSS for "pre[class*=\"language-\"]": {
 *         - this gets rid of flashing horizontal scroll on resize of window.
 * 
 * to disable word wrap
 *   - showLineNumbers={true} - on <SyntaxHighlighter>
 *   - wrapLongLines={false} - on <SyntaxHighlighter>
 *   - "wordWrap": "inherit", in CSS for "code" element... maybe exclude it somehow or "normal" seems to work too. 
 *   - "overflow": "auto", in CSS for "pre[class*=\"language-\"]": {
 */