import { Box, Stack, Button, Typography } from '@mui/material';
import React from 'react'

export const DevNotes = () => {
    const [showDevNotes, setShowDevNotes] = React.useState(false);

    return (
        <Stack sx={{ pl: '40px', maxWidth: '80%', filter: 'brightness(80%)', fontSize: '.8em'}}>
            <div style={{ display: 'inline-block' }}>
                <button onClick={() => setShowDevNotes(!showDevNotes)} style={{ background: 'none', border: 'none', padding: '0', font: 'inherit', cursor: 'pointer', outline: 'inherit' }}>
                    <b>{showDevNotes ? 'Hide': "Show"} Dev Notes</b>
                </button>
            </div>
            <br/>
            {showDevNotes &&
                <Box>
                  <b>4.0.9</b>
                    <ul>
                        <li>Timeout fixes. Timeout includes both times taken to deal with headers (possibly jwt calls) as well as api call. So if timeout is 10 seconds, and jwt takes 6
                            seconds and api is greater than 4 then we'll get a timeout. And if header processing takes &gt; 100 millis, we'll put up extra messaging so user knows that
                            a notable amount of time was spent processing headers (and some other misc processing). This should avoid confusion when user sets timeout to 10 seconds and
                            they know api responded in, say, 9 seconds, but they still got a timeout. They'll know it was the header processing that caused it.
                        </li>
                    </ul>                      
                  <b>4.0.8</b>
                    <ul>
                        <li>hitting enter will submit request when url is focused</li>
                        <li>fixed bug - request history should only be updated when response is 2xx, but rerun button wasn't checking status code before storing like RequestButton comp does.</li>
                    </ul>                       
                  <b>4.0.7</b>
                    <ul>
                        <li>Sorting auto suggest better so crest oauth/saved show up first</li>
                        <li>Updating version caption into seperate comp that supports fetch for when not running as ext.</li>
                        <li>URL auto complete updated to be case insensitive</li>
                        <li>Fixed <i>unique "key" prop</i> issue when i added subheader to history tab. Change from react fragment to Box so i could add key.</li>
                        <li>Updated show/hide headers so it only impacts responses and not request.</li>
                    </ul>                     
                  <b>4.0.6</b>
                    <ul>
                        <li>date subheader to better organize history tab items</li>
                        <li>bug fix for HEAD req - HEAD doesn't (or shouldn't) return a body, but the ext was still trying to parse/format it. Now we don't.</li>
                    </ul>                         
                    <b>4.0.5</b>
                    <ul>
                        <li>http-exchange.ts updated to know if running as ext or not so it can set "credentials: 'include'" on the fetch so that CORS requests support cookies like exts do (automagically include them)</li>
                        <li>cookie support</li>
                        <li>alphabetical order for oauth and saved</li>
                        <li>syncing history/saved/oauth across tabs</li>
                        <li>toggle dev notes</li>
                    </ul>            
                    <b>4.0.4</b>
                    <ul>
                        <li>Fix for syncing setting across tabs</li>
                    </ul>
                    <b>4.0.3</b>
                    <ul>
                        <li>initial release</li>
                    </ul>
                    <b>TODOs</b>
                    <ul>
                        <li>colapse so we only see response title line of response card</li>
                        <li>Response time and render time</li>
                        <li>Rename RcUtils to something else since i think we'll stick with cREST name.</li>
                        <li>RequestButton and RequestEditor has some overlapping validation code we could refactor into one place</li>
                        <li>Had to use a div in AppDrawer ListItemText for history to show the ellipsis on overflow, maybe url autocomplete needs the same?</li>
                        <li>rename storage to persistence.</li>
                        <li>when importing from legacy crest, headers (and urls) prefixed with crest* should be excluded since mui doesn't like when two autosuggests have the same value. they can overlap when header exists in history, and oauth bundle with same name exists.</li>
                        <li>configs non persistent headers, timeouts. Maybe one timeout which includes time for oauth (and header processing) plus real http req. So when calling for real http req, timeout should be timeout - header helper time </li>
                        <li>Line numbers not right alighted in some cases like when hitting crest resources or when running as web app instead of ext. In both cases, headers are limited so maybe something to do with that.</li>
                        <li>Basic auth support</li>
                        <li>Need logic to convert old storage to new, like uriHistory will be urlHistory, and simpleOAuth will be oauth.</li>
                        <li>Rename Storage.tsx to something else since Storage is an existing interface https://developer.mozilla.org/en-US/docs/Web/API/Storage</li>
                        <li>Maybe i should have a "main wrapper" where request building and responses all go in then i can control margins across the board?</li>
                        <li>prismjs 1.22.0 was last version that didn't have the formatting bug when body with xml or json has with mime type params. No formatting when they do.</li>
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
                </Box>
            }
        </Stack>
    )
}