import * as React from 'react';
import { ButtonGroup, Card, CardHeader, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, MenuList, Stack, Tooltip, Typography } from "@mui/material"
import { HttpHighlighter } from "./HttpHighlighter";
import { RcUtils } from '../support/RestClientUtils';
import { HttpExchangeContext } from "../support/RestClientUtils"
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ReplayIcon from '@mui/icons-material/Replay';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import DeleteIcon from '@mui/icons-material/Delete';
import WrapTextIcon from '@mui/icons-material/WrapText';
import ShareIcon from '@mui/icons-material/Share';
import SaveIcon from '@mui/icons-material/Save';
import HttpIcon from '@mui/icons-material/Http';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PublishIcon from '@mui/icons-material/Publish';
import CloseIcon from '@mui/icons-material/Close';
import IosShareIcon from '@mui/icons-material/IosShare';
import { Padding } from '@mui/icons-material';

export const HttpResponseCard = ({ exchange }: { exchange: HttpExchangeContext }) => {
    const renderCounter = React.useRef(0)
    console.log(`<HttpResponseCard /> rendered ${++renderCounter.current} times`)

    const [wordWrap, setWordWrap] = React.useState<boolean>(false)//need to pull initial value from local storage.
    const toggleWordWrap = () => {
        setWordWrap(!wordWrap)
    }

    const handleDelete = () => {
        console.log("TODO Handle DELETE. Need to figure out how to clean up any listeners and whatever else.");
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

    return (
        <Card elevation={RcUtils.defaultElevation}>
            <CardHeader
                sx={{ padding: '10px 15px 0px 15px' }}
                title={
                    <Stack direction='row' spacing={1.25} border={0} alignItems="center">
                        <Typography component="div" sx={{
                            backgroundColor: (theme) => exchange.response.statusCode < 400 ? theme.palette.success.main : theme.palette.error.main,
                            borderRadius: '5px', // Adjust this to change the roundness of the corners
                            padding: '1px 5px 1px 5px', // Adjust this to change the padding inside the box
                            // color: (theme) => theme.palette.text.primary
                            color: 'white',
                            fontWeight: 'bold',
                            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)'
                        }}>{exchange.response.statusCode}</Typography>
                        <Typography>{exchange.request.method}</Typography>
                        <Typography>{exchange.request.url}</Typography>

                    </Stack>
                }
                // subheader={
                //     'September 14, 2016'
                // }
                action={
                    <>
                        <ButtonGroup orientation='horizontal' aria-label='response button group'>
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
                        </ButtonGroup>
                        <Menu id='more-menu'
                            anchorEl={moreAnchorEl}
                            open={isMoreOpen}
                            MenuListProps={{ 'aria-labelledby': 'resources-button' }}
                            onClose={handleMoreClose}
                            // Checkout popover link below for more details on how to position the menu
                            // https://mui.com/material-ui/react-popover/
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
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
                    </>
                }
            />
            <HttpHighlighter headersAndBody={exchange.response.headersAndBody} wordWrap={wordWrap} />
        </Card>
    )
}