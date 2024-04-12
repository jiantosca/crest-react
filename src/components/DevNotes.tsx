import { Box } from '@mui/material';
import React from 'react'

export const DevNotes = () => {
    return (
        <Box sx={{ pl: '40px', maxWidth: '80%', filter: 'brightness(80%)' }}>
            <b>TODOs</b>
            <ul>
                <li>for saved requests use date sub list</li>
                <li>figure out for history if request has already been saved by comparing method, url, header, body so that duplicates aren't saved.</li>
                <li>Rename RcUtils to something else since i think we'll stick with cREST name.</li>
                <li>RequestButton and RequestEditor has some overlapping validation code we could refactor into one place</li>
                <li>Had to use a div in AppDrawer ListItemText for history to show the ellipsis on overflow, maybe url autocomplete needs the same?</li>
                <li>need to ensure we always have a content length, sometimes server don't return one.</li>
                <li>rename storage to persistence.</li>
                <li>Change oauths to use HttpRequestBundle with name instead of HttpRequest with only id? Or maybe optional name on HttpRequest and remove bundle? I dunno</li>
                <li>when importing from legacy crest, headers (and urls) prefixed with crest* should be excluded since mui doesn't like when two autosuggests have the same value. they can overlap when header exists in history, and oauth bundle with same name exists.</li>
                <li>consigs non persistent headers, timeouts. Maybe one timeout which includes time for oauth (and header processing) plus real http req. So when calling for real http req, timeout should be timeout - header helper time </li>
                <li>Line numbers not right alighted in some cases like when hitting crest resources or when running as web app instead of ext. In both cases, headers are limited so maybe something to do with that.</li>
                <li>Basic auth support</li>
                <li>Need logic to convert old storage to new, like uriHistory will be urlHistory, and simpleOAuth will be oauth.</li>
                <li>Rename Storage.tsx to something else since Storage is an existing interface https://developer.mozilla.org/en-US/docs/Web/API/Storage</li>
                <li>Maybe i should have a "main wrapper" where request building and responses all go in then i can control margins across the board?</li>
                <li>prismjs 1.22.0 was last version that didn't have the formatting bug when body with xml or json has with mime type params. No formatting when they do.</li>
                <li>
                    <b>Fetch related stuff</b>
                    <ul>
                        <li>More OAuth testing</li>
                    </ul>
                </li>
                <li>
                    <b>Drawer</b>
                    <ul>
                        <li>Delete all but locked responses (app drawer button i guess)</li>
                        <li>Revisit application context? Maybe it should be DrawerContext if only thing we need it for is the drawer.</li>
                    </ul>
                </li>                  
                <li>
                    <b>Request Builder</b>
                    <ul>
                        <li>URI autosuggest limit results to ??</li>
                        
                    </ul>
                </li>
                <li>
                    <b>Tests</b>
                    <ul>
                        <li>Unit test for response card rendering. Ensure it doesn't rerender unless expected. I added 'const theme = useTheme()' from '@mui/material/styles' and that alone cause each comp to rerender when new response came in. </li>
                        <li>Revisit application context? Maybe it should be DrawerContext if only thing we need it for is the drawer.</li>
                    </ul>
                </li>     
                <li>
                    <b>Misc</b>
                    <ul>
                        <li>Show/Hide dev notes</li>
                        <li>Styling: control padding '0px 20px 0px 20px' globally. I think cards do a bit different but still 20 plays role, should be able to change to 15 very easily.</li>
                        <li>Styling: use brightness for highlighter to make highlighting brighter? sample from DevNotes comp - filter: 'brightness(80%)' </li>
                    </ul>
                </li>                
                <li>
                    <b>Response Card Action Buttons</b>
                    <ul>
                        <li>Show/colapse reponses (new action button on response card)</li>
                        <li>Save request support</li>
                        <li>Save request support for oauth</li>
                        <li>Load in builder support</li>
                    </ul>
                </li>
            </ul>
            <b>1.0</b>
            <ul>
                <li>UX</li>
                <li>progress bar</li>
                <li>Stop/Abort button</li>
                <li>URI history setting in storage</li>
                <li>Header history in storage</li>
                <li>OAuth support</li>
                <li>Errow dialog for validation/http errors</li>
                <li>Header autosuggest</li>
                <li>URI autocomplete - prevent suggestion of existing input value</li>
            </ul>
            <b>0.1</b>
        </Box>
    )
}