import { Paper } from "@mui/material"
import { RcUtils } from '../support/RestClientUtils';
import { HttpExchangeContext } from "../support/RestClientUtils"
import { HttpHighlighter } from "./HttpHighlighter";
import * as React from 'react';

export const HttpResponse = ({exchange}: {exchange: HttpExchangeContext}) => {
    const renderCounter  = React.useRef(0)
    console.log(`<HttpResponse /> rendered ${++renderCounter.current} times`)

    return (
        <Paper elevation={RcUtils.defaultElevation}
            sx={{ padding: '10px', ml: '20px', mr: '20px', width: 'calc(100vw - 55px)' }}
        >
            <HttpHighlighter headersAndBody={exchange.response.headersAndBody}/>
        </Paper>
    )
}