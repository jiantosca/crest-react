import { Paper } from "@mui/material"
import { RcUtils } from '../support/RestClientUtils';
import { HttpExchangeContext } from "../support/RestClientUtils"
import { HttpFormatter } from "./HttpFormatter";

export const HttpResponse = ({exchange}: {exchange: HttpExchangeContext}) => {
    return (
        <Paper elevation={RcUtils.defaultElevation}
            sx={{ padding: '10px', ml: '20px', mr: '20px' }}
        >
            <HttpFormatter headersAndBody={exchange.response.headersAndBody}/>
        </Paper>
    )
}