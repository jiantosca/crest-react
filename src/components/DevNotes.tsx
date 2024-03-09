import { Box, List, ListItem, Paper } from '@mui/material';
import React from 'react'

export const DevNotes = () => {
    const items = ["Item 1", "Item 2", "Item 3"];

    return (
        <Box sx={{ pl: '40px', maxWidth: '80%', filter: 'brightness(80%)' }}>
            <b>TODOs</b>
            <ul>
                <li>Fix global noOption style in App.css but should really put that in component</li>
                <li>Maybe i should have a "main wrapper" where request building and responses all go in then i can control margins across the board?</li>
                <li>
                    <b>Fetch related stuff</b>
                    <ul>
                        <li>progress bar</li>
                        <li>Abort button</li>
                        <li>URI history setting in storage</li>
                        <li>Header history in storage</li>
                        <li>OAuth support</li>
                        <li>popup message when error happens. I think when response code is 0</li>
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
                        <li>Header autosuggest - maybe useAutoComplete hook? https://mui.com/material-ui/react-autocomplete/#useautocomplete</li>
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
                <li>intial setup and support</li>
            </ul>
            <b>0.1</b>
            <ul>
                <li>Rollback prismjs to 1.22.0. latest has bug formatting body with xml or json with mime type params</li>
            </ul>
        </Box>
    )
}