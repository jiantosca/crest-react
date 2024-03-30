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

const toolTipEnterDelay = 500

const toToolTipTitle = (bundleOrRequest: HttpRequest | HttpRequestBundle, buttons: React.ReactNode[]): React.ReactNode => {

        const formattedDate = (bundleOrRequest.timestamp) ? new Date(bundleOrRequest.timestamp)
                .toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true}) : ''
        
        const headers = (bundleOrRequest.headers && bundleOrRequest.headers.length > 0) ? 
            bundleOrRequest.headers.map(header => (<><br/>{header.name}: {header.value}</>)) : [<></>]
        return (
            <Stack direction='column' sx={{ maxWidth: 'none', overflowY: 'auto', maxHeight: 250 }}>
                <Stack direction='row' sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ whiteSpace: 'nowrap' }}>{formattedDate}</Box>
                    <Box>{buttons}</Box>
                </Stack>
                
                <Box>{bundleOrRequest.method} {bundleOrRequest.url}</Box>
                {headers && headers}
                {bundleOrRequest.body && <><br/><br/>{bundleOrRequest.body}</>}
            </Stack>
        )
}

export const AppDrawerTabs = () => {

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

    const buttons = 
    console.log('HistoryTabContent')
    return (
        <List>
            {/* <List subheader={
            <TextField style={{paddingLeft: '10px', alignContent: 'flex-end'}} size='small' variant={RcUtils.defaultVariant} />
        }> */}

            {
                Storage.listRequestHistory().map((request, index) => (
                    <Tooltip placement='right' enterDelay={toolTipEnterDelay} leaveDelay={0}
                        title={toToolTipTitle(request, [
                            <IconButton size='small' onClick={() => alert('save!')}><SaveIcon/></IconButton>, 
                            <IconButton size='small' onClick={() => alert('delete!')}><DeleteForeverIcon color='warning'/></IconButton>])
                        }>
                        <ListItemButton key={index} onClick={() => {
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
    return (
        <List>
            {
                Storage.listBundles().map((bundle, index) => (
                    <Tooltip placement='right' enterDelay={toolTipEnterDelay} leaveDelay={0}
                        title={toToolTipTitle(bundle, [
                            <IconButton size='small' onClick={() => alert('edit!')}><EditIcon/></IconButton>, 
                            <IconButton size='small' onClick={() => alert('delete!')}><DeleteForeverIcon color='warning'/></IconButton>])
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
    return (
        <List>
            {
                Storage.listOAuths().map((oauth, index) => (
                    <Tooltip placement='right' enterDelay={toolTipEnterDelay} leaveDelay={0}
                        title={toToolTipTitle(oauth, [
                            <IconButton size='small' onClick={() => alert('edit!')}><EditIcon/></IconButton>, 
                            <IconButton size='small' onClick={() => alert('delete!')}><DeleteForeverIcon color='warning'/></IconButton>])
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