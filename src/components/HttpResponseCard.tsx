import * as React from 'react';
import { ButtonGroup, Card, CardHeader, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, MenuList, Stack, Tooltip, Typography } from "@mui/material"
import { HttpHighlighter } from "./HttpHighlighter";
import { RcUtils } from '../support/rest-client-utils';
import { HttpExchange } from "../support/type.http-exchange"
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

export const HttpResponseCard = ({ exchange, deleteCallBack }: { exchange: HttpExchange, deleteCallBack: (id: string) => void }) => {
    const renderCounter = React.useRef(0)
    console.log(`<HttpResponseCard /> rendered ${++renderCounter.current} times`)

    const [wordWrap, setWordWrap] = React.useState<boolean>(false)//need to pull initial value from local storage.
    const toggleWordWrap = () => {
        setWordWrap(!wordWrap)
    }

    const handleDelete = () => {
        deleteCallBack(exchange.request.id)
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

    const [headersShowing, setHeadersShowing] = React.useState<boolean>(false)
    const toggleHeadersShowing = () => {
        setHeadersShowing(!headersShowing)
        handleMoreClose()
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
                    <Stack direction='row' spacing={1.25} border={0} alignItems="center" pb={.3}>
                        <Typography component="div" sx={{
                            backgroundColor: (theme) => exchange.response.statusCode < 400 ? theme.palette.success.main : theme.palette.error.main,
                            borderRadius: '5px', // Adjust this to change the roundness of the corners
                            padding: '1px 5px 1px 5px', // Adjust this to change the padding inside the box
                            // color: (theme) => theme.palette.text.primary
                            color: 'white',
                            fontWeight: 'bold',
                            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
                            fontSize: '1.05rem'
                        }}>{exchange.response.statusCode}</Typography>
                        <Typography sx={{
                            fontSize: '1.05rem',
                        }}
                        >{exchange.request.method}</Typography>
                        <Typography sx={{
                            fontSize: '1.05rem'
                            // overflowWrap: "break-word",
                            // wordBreak: 'break-word',
                        }}>{exchange.request.url}</Typography>
                    </Stack>
                }


                // subheader={
                //     'September 14, 2016'
                // }

                action={
                        <ButtonGroup sx={{pl: '10px'}} orientation='horizontal' aria-label='response button group'>
                            <Tooltip title='Toggle word wrap'>
                                <IconButton aria-label="rerun" size={iconSize} onClick={toggleWordWrap}>
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
                            <IconButton aria-label="rerun" size={iconSize}>
                                <ReplayIcon color={iconColor} />
                            </IconButton>
                            <IconButton aria-label="more" size={iconSize}
                                id='more-button'
                                onClick={handleMoreClick}
                                aria-controls={isMoreOpen ? 'more-menu' : undefined}
                                aria-haspopup='true'
                                aria-expanded={isMoreOpen ? 'true' : undefined}
                            >
                                <MoreVertIcon color={iconColor} />
                            </IconButton>
                            <IconButton aria-label="delete" size={iconSize} onClick={handleDelete}>
                                {/* <DeleteIcon color={iconDeleteColor} /> */}
                                <CloseIcon color={iconDeleteColor} />
                            </IconButton>
                            <Menu id='more-menu'
                            anchorEl={moreAnchorEl}
                            open={isMoreOpen}
                            MenuListProps={{ 'aria-labelledby': 'resources-button' }}
                            onClose={handleMoreClose}
                            // Checkout popover link below for more details on how to position the menu
                            // https://mui.com/material-ui/react-popover/
                            // anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            // transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        >
                            <MenuList>
                                <MenuItem onClick={handleMoreClose}>
                                    <ListItemIcon><HttpIcon /></ListItemIcon>
                                    <ListItemText>Request</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={toggleHeadersShowing}>
                                    <ListItemIcon>{headersShowing ? (<RemoveCircleOutlineIcon />) : (<AddCircleOutlineIcon />)}</ListItemIcon>
                                    <ListItemText>Headers</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={handleMoreClose}>
                                    <ListItemIcon><PublishIcon /></ListItemIcon>
                                    <ListItemText>Load</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={handleMoreClose}>
                                    <ListItemIcon><SaveIcon /></ListItemIcon>
                                    <ListItemText>Save</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={handleMoreClose}>
                                    <ListItemIcon><IosShareIcon /></ListItemIcon>
                                    <ListItemText>Share</ListItemText>
                                </MenuItem>
                            </MenuList>
                        </Menu>
                        </ButtonGroup>
                }
            />
            <HttpHighlighter httpResponse={exchange.response} wordWrap={wordWrap} />
        </Card>
    )
}