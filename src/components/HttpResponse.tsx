import * as React from 'react';
import { Button, Paper } from "@mui/material"
import { HttpHighlighter } from "./HttpHighlighter";
import { RcUtils } from '../support/RestClientUtils';
import { useDrawerContext } from '../support/Context';
import { HttpExchangeContext } from "../support/RestClientUtils"

export const HttpResponse = ({exchange}: {exchange: HttpExchangeContext}) => {
    const renderCounter  = React.useRef(0)
    console.log(`<HttpResponse /> rendered ${++renderCounter.current} times`)
    const drawerState = useDrawerContext()
    const widthOffset = drawerState.isOpen ? drawerState.width + 40 : 40

    return (
        <Paper elevation={RcUtils.defaultElevation}
            sx={ { padding: '10px', ml: '20px', mr: '20px', width: `calc(100vw - ${widthOffset}px)` }}>

            <HttpHighlighter headersAndBody={exchange.response.headersAndBody}/>
        </Paper>
    )
}