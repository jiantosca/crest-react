import * as React from 'react'
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { Tab, Tabs, Divider, Box, Typography, Tooltip, Stack, IconButton } from '@mui/material';
import { loadRequestEventType } from './RequestBuilder'
import { Storage } from '../support/storage';
import { HttpRequest } from '../support/http-exchange';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { useApplicationContext } from '../support/react-contexts';
import { RequestEditor } from './RequestEditor';
import PublishIcon from '@mui/icons-material/Publish';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useTheme } from '@mui/material/styles';

const storageEventName = 'storage'

const toToolTip = (httpRequest: HttpRequest, includeDateInToolTip: boolean): React.ReactNode => {
    const formattedDate = (httpRequest.timestamp) ? new Date(httpRequest.timestamp)
        .toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        }) : ''

    const headers = (httpRequest.unresolvedHeaders && httpRequest.unresolvedHeaders.length > 0) ? (<Box pt={1}>{
        httpRequest.unresolvedHeaders.map((header, index) => (<Box key={index}>{header.name}: {header.value}</Box>))
    }</Box>) : undefined

    return (
        <Stack direction='column' sx={{ maxWidth: 'none', overflowY: 'auto', maxHeight: 250 }}>
            {includeDateInToolTip && <Box sx={{ whiteSpace: 'nowrap' }}>{formattedDate}</Box>}
            <Box pt={1}>{httpRequest.method} {httpRequest.url}</Box>
            {headers && headers}
            {httpRequest.body && <Box pt={1}>{httpRequest.body}</Box>}
        </Stack>
    )
}

export const AppDrawerTabs = () => {
    const renderCounter = React.useRef(0)
    console.log(`<AppDrawerTabs /> rendered ${++renderCounter.current} times`)

    const [tabValue, setTabValue] = React.useState(0)
    const handleTabChange = (event: React.SyntheticEvent, newTabValue: number) => {
        setTabValue(newTabValue)
    }
    const tabPanels: React.ReactNode[] = [
        <HistoryTabContent />, <SavedTabContent />, <OAuthTabContent />
    ]

    return (
        <>
            <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="History" id='tab-history' />
                <Tab label="Saved" id='tab-saved' />
                <Tab label="OAuth" id='tab-oauth' />
            </Tabs>
            <Divider />
            <Box sx={{
                height: '100vh',
                overflowY: 'scroll'
            }}>

                {tabPanels[tabValue]}
            </Box>
        </>
    )
}

const HistoryTabContent = () => {
    const renderCounter = React.useRef(0)
    console.log(`<HistoryTabContent /> rendered ${++renderCounter.current} times`)

    const [requests, setRequests] = React.useState<HttpRequest[]>(Storage.listRequestHistory())

    const appContext = useApplicationContext()

    const handleSave = (httpRequest: HttpRequest) => {
        appContext.showDialog('Save Request', <RequestEditor httpRequest={httpRequest} isOauth={httpRequest.isOAuth} />, false)
    }

    const handleDelete = (httpRequest: HttpRequest) => {
        const filtered = Storage.listRequestHistory().filter(request => request.id !== httpRequest.id)
        Storage.storeRequestHistory(filtered)
    }

    React.useEffect(() => {
        const handleUpdate = (e: Event) => {
            setRequests((e as CustomEvent).detail as HttpRequest[])
        }
        const handleStorageEvent = (e: StorageEvent) => {
            if (e.key === Storage.Keys.requestHistory) {
                setRequests(Storage.listRequestHistory())
            }
        }
        document.addEventListener(Storage.requestHistoryUpdateEventName, handleUpdate)
        window.addEventListener(storageEventName, handleStorageEvent)
        // Cleanup
        return () => {
            document.removeEventListener(Storage.requestHistoryUpdateEventName, handleUpdate)
            window.removeEventListener(storageEventName, handleStorageEvent)

        }
    }, [])

    return (
        <List>
            {
                requests.map((request, index) => (
                    <HttpRequestListItem key={index} request={request}
                        displayText={`${request.method} ${request.url}`}
                        includeDateInToolTip={true}
                        //wordWrap={false}
                        wordWrap={true}
                        deleteButton={<IconButton key='delete' size='small' onClick={() => handleDelete(request)}><DeleteForeverIcon color='warning' /></IconButton>}
                        buttons={[
                            <IconButton key={`save-${index}`} size='small' onClick={() => handleSave(request)}><SaveIcon /></IconButton>
                        ]}
                    />
                ))
            }
        </List>)
}

const SavedTabContent = () => {
    const renderCounter = React.useRef(0)
    console.log(`<SavedTabContent /> rendered ${++renderCounter.current} times`)

    const [requests, setRequests] = React.useState<HttpRequest[]>(Storage.listHttpRequests())

    const appContext = useApplicationContext()

    const handleEdit = (httpRequest: HttpRequest) => {
        appContext.showDialog(`Editing '${httpRequest.name}'`, <RequestEditor httpRequest={httpRequest} />, false)
    }

    const handleCopy = (httpRequest: HttpRequest) => {
        const httpRequestCopy = { ...httpRequest, name: '' }
        appContext.showDialog(`Copying '${httpRequest.name}'`, <RequestEditor httpRequest={httpRequestCopy} />, false)
    }

    const handleDelete = (httpRequest: HttpRequest) => {
        const filtered = Storage.listHttpRequests().filter(request => request.name !== httpRequest.name)
        Storage.storeHttpRequests(filtered)
    }

    React.useEffect(() => {
        const handleUpdate = (e: Event) => {
            setRequests((e as CustomEvent).detail as HttpRequest[])
        }
        const handleStorageEvent = (e: StorageEvent) => {
            if (e.key === Storage.Keys.savedRequests) {
                setRequests(Storage.listHttpRequests())
            }
        }
        document.addEventListener(Storage.savedRequestsUpdateEventName, handleUpdate)
        window.addEventListener(storageEventName, handleStorageEvent)
        // Cleanup
        return () => {
            document.removeEventListener(Storage.savedRequestsUpdateEventName, handleUpdate)
            window.removeEventListener(storageEventName, handleStorageEvent)
        }
    }, [])

    return (
        <List>
            {
                requests.map((request, index) => (
                    <HttpRequestListItem key={index} request={request}
                        displayText={request.name}
                        wordWrap={true}
                        includeDateInToolTip={false}
                        deleteButton={<IconButton key='delete' size='small' onClick={() => handleDelete(request)}><DeleteForeverIcon color='warning' /></IconButton>}
                        buttons={[
                            <IconButton key={`edit-${index}`} size='small' onClick={() => handleEdit(request)}><EditIcon /></IconButton>,
                            <IconButton key={`copy-${index}`} size='small' onClick={() => handleCopy(request)}><ContentCopyIcon /></IconButton>
                        ]}
                    />
                ))
            }
        </List>)
}

const OAuthTabContent = () => {
    const renderCounter = React.useRef(0)
    console.log(`<OAuthTabContent /> rendered ${++renderCounter.current} times`)

    const [requests, setRequests] = React.useState<HttpRequest[]>(Storage.listOAuths())

    const appContext = useApplicationContext()

    const handleEdit = (httpRequest: HttpRequest) => {
        appContext.showDialog(`Editing '${httpRequest.name}'`, <RequestEditor httpRequest={httpRequest} isOauth={true} />, false)
    }

    const handleCopy = (httpRequest: HttpRequest) => {
        const httpRequestCopy = { ...httpRequest, name: '' }
        appContext.showDialog(`Copying '${httpRequest.name}'`, <RequestEditor httpRequest={httpRequestCopy} isOauth={true} />, false)
    }

    const handleDelete = (httpRequest: HttpRequest) => {
        const filtered = Storage.listOAuths().filter(request => request.name !== httpRequest.name)
        Storage.storeOAuths(filtered)
    }

    React.useEffect(() => {
        const handleUpdate = (e: Event) => {
            setRequests((e as CustomEvent).detail as HttpRequest[])
        }
        const handleStorageEvent = (e: StorageEvent) => {
            if (e.key === Storage.Keys.oauths) {
                setRequests(Storage.listOAuths())
            }
        }
        document.addEventListener(Storage.oauthsUpdateEventName, handleUpdate)
        window.addEventListener(storageEventName, handleStorageEvent)

        // Cleanup
        return () => {
            document.removeEventListener(Storage.oauthsUpdateEventName, handleUpdate)
            window.removeEventListener(storageEventName, handleStorageEvent)

        };
    }, [])

    return (
        <List>
            {
                requests.map((request, index) => (
                    <HttpRequestListItem key={index} request={request}
                        displayText={request.name}
                        wordWrap={true}
                        includeDateInToolTip={false}
                        deleteButton={<IconButton key='delete' size='small' onClick={() => handleDelete(request)}><DeleteForeverIcon color='warning' /></IconButton>}
                        buttons={[
                            <IconButton key={`edit-${index}`} size='small' onClick={() => handleEdit(request)}><EditIcon /></IconButton>,
                            <IconButton key={`copy-${index}`} size='small' onClick={() => handleCopy(request)}><ContentCopyIcon /></IconButton>,
                            // <IconButton key={`header-${index}`} size='small' onClick={() => alert('header!')}><HeaderIcon/></IconButton>
                        ]}
                    />
                ))
            }
        </List>)
}

const HttpRequestListItem = ({ request, displayText, wordWrap, includeDateInToolTip, deleteButton, buttons }:
    {
        request: HttpRequest,
        displayText: string,
        wordWrap: boolean,
        includeDateInToolTip: boolean,
        deleteButton: React.ReactNode,
        buttons: React.ReactNode[]
    }) => {

    const renderCounter = React.useRef(0)
    console.log(`<HttpRequestListItem /> rendered ${++renderCounter.current} times`)

    const [isHovered, setIsHovered] = React.useState(false)

    const populatedToolTipTitle = <Typography component='div' sx={{ fontSize: '1.25em' }}>{toToolTip(request, includeDateInToolTip)}</Typography>

    const [toolTipTitle, setToolTipTitle] = React.useState<React.ReactNode>(populatedToolTipTitle)

    const buttonBox =
        <Box display="flex" justifyContent="space-between">
            {deleteButton}
            <Box>
                {buttons}
                {/* Customized how tooltip is displayed a little bit. So hovering the load button will show the tooltip so user can peek at the request before loading it. But onece 
                the user clicks, the tool tip is just in the way so we'll hide it.  We set the tooltip to null causingn it to dissapear, then on mouse leave we can set the tooltip
                back to the way it was. I'm using a timeout because if cursor moving real slow the tool tip will show real quick during the onMouseLeave even. */}
                <Tooltip key='read-more' placement='right'
                    enterDelay={300}
                    leaveDelay={300}
                    title={toolTipTitle}>
                    <IconButton key='load' size='small'
                        onClick={() => {
                            setToolTipTitle(null)
                            document.dispatchEvent(new CustomEvent(loadRequestEventType, { detail: request }))
                        }}
                        onMouseLeave={() => setTimeout(() => setToolTipTitle(populatedToolTipTitle), 500)}>
                        <PublishIcon />
                    </IconButton>
                </Tooltip>
            </Box>
        </Box>

    const displayTextTypography = (!wordWrap) ?
        <Typography sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {displayText}
        </Typography>
        :
        <Typography>{displayText}</Typography>

    return (

        <ListItemButton disableRipple sx={{ cursor: 'default' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}>

            <Stack direction='column' width="100%" overflow="hidden">
                <ListItemText primary={displayTextTypography} />
                {isHovered && buttonBox}
            </Stack>
        </ListItemButton>
    )
}

const HeaderIcon = () => {
    const theme = useTheme();
    return (
        <svg width="24" height="24" viewBox="0 0 24 24">
            <text x="12" y="18" textAnchor="middle" fontSize="18" fontFamily="Arial, sans-serif"
                fontWeight="bold"
                fill={theme.palette.text.primary}>{'{:}'}
            </text>
        </svg>
    );
}