import * as React from 'react'
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { Tab, Tabs, Divider, Box, Typography, Tooltip, Stack, Button, IconButton } from '@mui/material';
import { loadBundleEventType } from './RequestBuilder'
import { Storage } from '../support/storage';
import { HttpRequest, HttpRequestBundle } from '../support/http-exchange';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { useApplicationContext } from '../support/react-contexts';
import { RequestEditor } from './RequestEditor';

const toolTipEnterDelay = 500

const toToolTipTitle = (bundle: HttpRequestBundle, buttons: React.ReactNode[]): React.ReactNode => {
    const formattedDate = (bundle.timestamp) ? new Date(bundle.timestamp)
            .toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true}) : ''
    
    const headers = (bundle.headers && bundle.headers.length > 0) ? (<Box pt={1}>{
        bundle.headers.map((header, index) => (<Box key={index}>{header.name}: {header.value}</Box>))
    }</Box>) : undefined

    return (
        <Stack direction='column' sx={{ maxWidth: 'none', overflowY: 'auto', maxHeight: 250 }}>
            <Stack direction='row' sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ whiteSpace: 'nowrap' }}>{formattedDate}</Box>
                <Box>{buttons}</Box>
            </Stack>
            <Box pt={1}>{bundle.method} {bundle.url}</Box>
            {headers && headers} 
            {bundle.body && <Box pt={1}>{bundle.body}</Box>}
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
        <HistoryTabContent />, <BundlesTabContent />, <OAuthTabContent />
    ]

    return (
        <>
            <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="History" id='tab-history' />
                <Tab label="Bundles" id='tab-bundles' />
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

    const appContext = useApplicationContext()

    const handleSave = (httpRequest: HttpRequest) => {
        const bundle = {
            name: httpRequest.id,
            ...httpRequest
        }

        appContext.showDialog('Save Request', <RequestEditor bundle={bundle} />)
    }

    return (
        <List>
            {/* <List subheader={
            <TextField style={{paddingLeft: '10px', alignContent: 'flex-end'}} size='small' variant={RcUtils.defaultVariant} />
        }> */}

            {
                Storage.listRequestHistory().map((request, index) => (
                    <Tooltip key={`toolTip-${index}`} placement='right' enterDelay={toolTipEnterDelay} leaveDelay={0}
                        title={toToolTipTitle({name: `ID ${request.id}`, ...request}, [
                            <IconButton key={`save-${index}`} size='small' onClick={() => handleSave(request)}><SaveIcon/></IconButton>, 
                            <IconButton key={`delete-${index}`} size='small' onClick={() => alert('delete!')}><DeleteForeverIcon color='warning'/></IconButton>])
                        }>

                        <ListItemButton onClick={() => {
                            document.dispatchEvent(new CustomEvent(loadBundleEventType, { detail: request }))
                        }}>
                            <ListItemText primary={<Typography sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}>
                                {`${request.method} ${request.url} `}
                            </Typography>} />

                        </ListItemButton>
                    </Tooltip>
                ))
            }
        </List>)
}

const BundlesTabContent = () => {
    const renderCounter = React.useRef(0)
    console.log(`<BundlesTabContent /> rendered ${++renderCounter.current} times`)

    return (
        <List>
            {
                Storage.listBundles().map((bundle, index) => (
                    <Tooltip key={`toolTip-${index}`} placement='right' enterDelay={toolTipEnterDelay} leaveDelay={0}
                        title={toToolTipTitle(bundle, [
                            <IconButton key={`edit-${index}`} size='small' onClick={() => alert('edit!')}><EditIcon/></IconButton>, 
                            <IconButton key={`delete-${index}`} size='small' onClick={() => alert('delete!')}><DeleteForeverIcon color='warning'/></IconButton>])
                    }>

                    <ListItemButton key={index} onClick={() => {
                        document.dispatchEvent(new CustomEvent(loadBundleEventType, { detail: bundle }))
                    }}>
                        <ListItemText primary={<div style={{
                        }}>
                            {bundle.name}
                        </div>} />

                    </ListItemButton>
                    </Tooltip>
                ))
            }
        </List>)
}

const OAuthTabContent = () => {
    const renderCounter = React.useRef(0)
    console.log(`<OAuthTabContent /> rendered ${++renderCounter.current} times`)

    return (
        <List>
            {
                Storage.listOAuths().map((oauth, index) => (
                    <Tooltip key={`toolTip-${index}`} placement='right' enterDelay={toolTipEnterDelay} leaveDelay={0}
                        title={toToolTipTitle({name: oauth.id, ...oauth}, [
                            <IconButton key={`edit-${index}`} size='small' onClick={() => alert('edit!')}><EditIcon/></IconButton>, 
                            <IconButton key={`delete-${index}`} size='small' onClick={() => alert('delete!')}><DeleteForeverIcon color='warning'/></IconButton>])
                        }>
                        <ListItemButton key={index} onClick={() => {
                            document.dispatchEvent(new CustomEvent(loadBundleEventType, { detail: oauth }))
                        }}>
                            <ListItemText primary={<div style={{
                            }}>
                                {oauth.id}
                            </div>} />

                        </ListItemButton>
                    </Tooltip>
                ))
            }
        </List>)
}