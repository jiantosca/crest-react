import * as React from 'react';
import { Button, Paper, Stack } from "@mui/material"
import { HttpHighlighter } from "./HttpHighlighter";
import { RcUtils } from '../support/RestClientUtils';
import { useDrawerContext } from '../support/Context';
import { HttpExchangeContext } from "../support/RestClientUtils"

export const HttpResponse = ({exchange}: {exchange: HttpExchangeContext}) => {
    const renderCounter  = React.useRef(0)
    console.log(`<HttpResponse /> rendered ${++renderCounter.current} times`)

    const drawerState = useDrawerContext()
    //const widthOffset = drawerState.isOpen ? drawerState.width + 40 : 40
    // change to 55 when adding button. I should probably try some other layout instead of
    // just <Paper> with a <Stack>
    const widthOffset = drawerState.isOpen ? drawerState.width + 55 : 55

    const [wordWrap, setWordWrap] = React.useState<boolean>(false)//need to pull initial value from local storage.
    const toggleWordWrap = () => {
        setWordWrap(!wordWrap)
    }

    const handleDelete = () => {
        console.log("TODO Handle DELETE. Need to figure out how to clean up any listeners and whatever else.");
    }

    return (
        <Paper elevation={RcUtils.defaultElevation}
            sx={ { padding: '10px', ml: '20px', mr: '20px', maxWidth: `calc(100vw - ${widthOffset}px)` }}>
            
            <Stack direction='row' sx={{border: '1px solid white'}}>
                <Button onClick={toggleWordWrap}>Wrap</Button>
                <Button>Lock</Button>
                <Button onClick={handleDelete}>Delete</Button>
            </Stack>
            
            <HttpHighlighter headersAndBody={exchange.response.headersAndBody} wordWrap={wordWrap}/>
        </Paper>
    )
}