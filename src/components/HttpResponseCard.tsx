import * as React from 'react';
import { Alert, Box, ButtonGroup, Card, CardHeader, Divider, IconButton, LinearProgress, ListItemIcon, ListItemText, Menu, MenuItem, MenuList, Stack, Tooltip, Typography } from "@mui/material"
import { HttpHighlighter } from "./HttpHighlighter";
import { RcUtils } from '../support/rest-client-utils';
import { HttpExchange, HttpExchangeHandler } from "../support/http-exchange"
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ReplayIcon from '@mui/icons-material/Replay';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import WrapTextIcon from '@mui/icons-material/WrapText';
import SaveIcon from '@mui/icons-material/Save';
import HttpIcon from '@mui/icons-material/Http';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PublishIcon from '@mui/icons-material/Publish';
import CloseIcon from '@mui/icons-material/Close';
import IosShareIcon from '@mui/icons-material/IosShare';
import { AppSettings } from '../support/settings';
import { HeaderHelper } from '../support/header-helper';
import { useApplicationContext } from '../support/react-contexts'
import { loadRequestEventType } from './RequestBuilder'
import { RequestEditor } from './RequestEditor';
import { Storage } from '../support/storage'

export const HttpResponseCard = ({ exchange, deleteCallBack }: { exchange: HttpExchange, deleteCallBack: (id: string) => void }) => {
    const renderCounter = React.useRef(0)
    console.log(`<HttpResponseCard /> rendered ${++renderCounter.current} times`)

    //save exchange in state so we can rerun the request for a new exchange and update this component
    const [exchangeState, setExchangeState] = React.useState<HttpExchange>(exchange)
    const [rerunInFlight, setRerunInFlight] = React.useState<boolean>(false)
    const [wordWrap, setWordWrap] = React.useState<boolean>(AppSettings.isWordWrap())

    const appContext = useApplicationContext()
    const isHttp = exchangeState.request.url.startsWith('http')

    const toggleWordWrap = () => {
        setWordWrap(!wordWrap)
    }

    const handleDelete = () => {
        deleteCallBack(exchangeState.request.id)
    }

    const [moreAnchorEl, setMoreAnchorEl] = React.useState<null | HTMLElement>(null)
    const isMoreOpen = Boolean(moreAnchorEl)
    const handleMoreClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setMoreAnchorEl(event.currentTarget)
    }
    const handleMoreClose = () => {
        setMoreAnchorEl(null)
    }

    const [locked, setLocked] = React.useState<boolean>(false)
    const toggleLock = () => {
        setLocked(!locked)
    }

    const [minimalHeaders, setMinimalHeaders] = React.useState<boolean>(false)
    const toggleMinimalHeaders = () => {
        handleMoreClose()
        setMinimalHeaders(!minimalHeaders)
        
    }

    const [showRequest, setShowRequest] = React.useState<boolean>(false)
    const toggleShowRequest = () => {
        if(exchange.request.headers.length === 0 && !exchange.request.body) {
            appContext.showDialog(' ', <Alert severity="info">The request has no headers or body to show.</Alert>)
        } else {
            setShowRequest(!showRequest)
        }
        
        handleMoreClose()
    }
    const handleSave = () => {
        appContext.showDialog('Save Request', <RequestEditor httpRequest={exchange.request} isOauth={exchange.request.isOAuth}/>, false)
        handleMoreClose()
    }

    const handleLoad = () => {
        handleMoreClose()
        // when loading the request builder gets the load event, it'll scroll to the top of the page. But when trigging
        // via popup menu like i'm doing here it doesn't scroll up all the way. So adding a bit of a timeout so the menu
        // has time to close before triggering the event ...this seems to work. Note if even trigger from some other place
        // that isn't via popup menu, no need for the setTimout (like in the loads via drawer tabs for history, saved, and oauth)
        //document.dispatchEvent(new CustomEvent(loadRequestEventType, { detail: exchange.request }))
        window.setTimeout(() => {
            document.dispatchEvent(new CustomEvent(loadRequestEventType, { detail: exchange.request }))
        }, 100)
    }

    /**
     * This method has some overlap with RequestButton's sendClickCallback that handles http calls, but presumably much less to
     * do on a rerun like validation and controlling all the state associated with the request builder. No stop button either, but
     * I should add that at some point. 
     */
    const handleRerun = async () => {
        setRerunInFlight(true)
        const headerHelper = new HeaderHelper(exchangeState.request.unresolvedHeaders, exchangeState.request.id, appContext.showDialog)

        const exchangeCompletionHandler = (exchange: HttpExchange) => {
            if (exchange.response.statusCode === 0) {
                RcUtils.showNoStatusCodeDialog(exchange, appContext)
            } else {
                if (!RcUtils.isExtensionRuntime()) {
                    exchange.response.headers.push({ name: 'headers-suppressed', value: 'because not running as extension (see fetch & Access-Control-Expose-Headers)' })
                  }
                if (exchange.response.statusCode < 300) {
                    Storage.updateRequestHistory(exchange.request)        
                }
                setExchangeState(exchange)
            }
            
            setRerunInFlight(false)
        }

        try {
            const resolvedHeaders = await headerHelper.resolveHeaders()
            const request = {
                ...exchangeState.request,
                headers: resolvedHeaders
            }
            if (RcUtils.isExtensionRuntime()) {
                console.log('<RequestButton />.sendClickCallback running as extension')
                chrome.runtime.sendMessage(request, exchangeCompletionHandler);
              } else {
                console.log('<RequestButton />.sendClickCallback not running as extension')
                const httpExchangeHandler = new HttpExchangeHandler(request, false)
                httpExchangeHandler.submitRequest().then(exchangeCompletionHandler)
              }            
          } catch (error) {
            console.log('Header helper was either aborted, or if there was a real issue it should have already triggered ' +
              'a dialog for the user to review the issue. Error: ', error)
            setRerunInFlight(false)
            return;
          }
    }
    
    const iconSize = RcUtils.iconButtonSize
    const iconColor = 'inherit'
    const iconDeleteColor = 'warning'
    
    // I was playing with below, and all the sudden every instance of this comp was getting rerednered when new 
    // response was added. Not sure why cause theme wasn't changing. 
    //import { useTheme } from '@mui/material/styles';
    //const theme = useTheme()
    // console.log({theme})

    // sample of how you can feed in/use theme for sx
    // sx={{border: '1px solid white', background: (theme) => theme.palette.background.paper}}
    return (
        <Card elevation={RcUtils.defaultElevation}>
            {/* not getting ellipsis to work, but this does ensure long titles don't push the action buttons 
            off the card
            https://stackoverflow.com/questions/61675880/react-material-ui-cardheader-title-overflow-with-dots */}
            <CardHeader
                sx={{ 
                    padding: '10px 15px 0px 15px', 

                    //we can do stuff below to make the card header title overflow but i can't get
                    //elipsis to work.  I think it's because the title is a stack of elements and not a single
                    //{"title..."}. Or i can comment below, and uncomment the stuff under url typography for 
                    //wrapping instead.
                    display: "flex",
                    overflow: "hidden",
                    "& .MuiCardHeader-content": {
                        overflow: "hidden",
                    }
                }}
                title={
                    // .3 padding on the bottom cause action buttons were 
                    <Stack direction='row' spacing={1.25} border={0} alignItems="center" pb={.4}>
                        <Typography component="div" sx={{
                            backgroundColor: (theme) => exchangeState.response.statusCode < 400 ? theme.palette.success.main : theme.palette.error.main,
                            borderRadius: '5px', // Adjust this to change the roundness of the corners
                            padding: '1px 5px 1px 5px', // Adjust this to change the padding inside the box
                            color: 'white',
                            fontWeight: 'bold',
                            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
                            //fontSize: '1.05rem'
                        }}>{exchangeState.response.statusCode}</Typography>
                        <Typography sx={{
                            //fontSize: '1.05rem',
                        }}
                        >{exchangeState.request.method}</Typography>
                        <Typography sx={{
                            // fontSize: '1.05rem'
                            // overflowWrap: "break-word",
                            // wordBreak: 'break-word',
                        }}>{exchangeState.request.url}</Typography>
                    </Stack>
                }
                //subheader={'I could put response times here'}
                action={
                        <ButtonGroup sx={{pl: '10px'}} orientation='horizontal' aria-label='response button group'>
                            <IconButton disabled={!isHttp || rerunInFlight} aria-label="rerun" size={iconSize} onClick={handleRerun}>
                                <ReplayIcon color={iconColor} />
                            </IconButton>
                            <Tooltip title='Toggle word wrap' enterDelay={1000}>
                                <IconButton aria-label="wordwrap" size={iconSize} onClick={toggleWordWrap}>
                                    <WrapTextIcon color={iconColor} />
                                </IconButton>
                            </Tooltip>
                            {locked ? (
                                <IconButton aria-label="lock" size={iconSize} onClick={toggleLock}>
                                    <LockIcon color={iconColor} />
                                </IconButton>) : (
                                <IconButton aria-label="unlock" size={iconSize} onClick={toggleLock}>
                                    <LockOpenIcon color={iconColor} />
                                </IconButton>)}
                            <IconButton aria-label="more" size={iconSize}
                                id='more-button'
                                onClick={handleMoreClick}
                                aria-controls={isMoreOpen ? 'more-menu' : undefined}
                                aria-haspopup='true'
                                aria-expanded={isMoreOpen ? 'true' : undefined}
                            >
                                <MoreVertIcon color={iconColor} />
                            </IconButton>

                            <IconButton aria-label="delete" size={iconSize} onClick={handleDelete} disabled={locked}>
                                {/* <DeleteIcon color={iconDeleteColor} /> */}
                                {/* <DeleteForeverOutlinedIcon color={iconDeleteColor}></DeleteForeverOutlinedIcon> */}
                                <CloseIcon color={locked ? iconColor:iconDeleteColor} />
                            </IconButton>

                            <Menu id='more-menu'
                            anchorEl={moreAnchorEl}
                            open={isMoreOpen}
                            //can't remember why i needed below, seems to work without it
                            //MenuListProps={{ 'aria-labelledby': 'resources-button' }}
                            onClose={handleMoreClose}
                            // Checkout popover link below for more details on how to position the menu
                            // https://mui.com/material-ui/react-popover/
                            // anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            // transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        >
                            <MenuList>
                                <MenuItem onClick={toggleShowRequest}>
                                    {/* <ListItemIcon><HttpIcon /></ListItemIcon> */}
                                    <ListItemIcon>{showRequest ? (<RemoveCircleOutlineIcon />) : (<AddCircleOutlineIcon />)}</ListItemIcon>
                                    <ListItemText>Request</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={handleLoad}>
                                    <ListItemIcon><PublishIcon /></ListItemIcon>
                                    <ListItemText>Load</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={handleSave}>
                                    <ListItemIcon><SaveIcon /></ListItemIcon>
                                    <ListItemText>Save</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={toggleMinimalHeaders} disabled={false}>
                                    <ListItemIcon>{minimalHeaders ? (<AddCircleOutlineIcon />) : (<RemoveCircleOutlineIcon />)}</ListItemIcon>
                                    <ListItemText>Headers</ListItemText>
                                </MenuItem> 
                                <MenuItem onClick={handleMoreClose} disabled={true}>
                                    <ListItemIcon><IosShareIcon /></ListItemIcon>
                                    <ListItemText>Share</ListItemText>
                                </MenuItem>
                            </MenuList>
                        </Menu>
                        </ButtonGroup>
                }
            />
            {rerunInFlight && <Box padding='10px 10px 0px 10px'><LinearProgress color='primary' /></Box>}
            
            {/* {showRequest && <HttpHighlighter requestOrResponse={exchangeState.request} wordWrap={wordWrap} />} */}
            
            <Box sx={{ padding: '15px 15px 10px 20px'}} >
            {
                showRequest ? 
                    <Stack>
                        <Typography>Request</Typography>
                        <Box pl={'10px'}><HttpHighlighter requestOrResponse={exchangeState.request} wordWrap={wordWrap} minimalHeaders={false}/></Box>
                        <Divider/>
                        <Typography pt={'15px'}>Response</Typography>
                        <Box pl={'10px'}><HttpHighlighter requestOrResponse={exchangeState.response} wordWrap={wordWrap} minimalHeaders={minimalHeaders}/></Box>
                    </Stack>
                    :
                    <HttpHighlighter requestOrResponse={exchangeState.response} wordWrap={wordWrap} minimalHeaders={minimalHeaders}/>
            }
            </Box>
        </Card>
    )
}