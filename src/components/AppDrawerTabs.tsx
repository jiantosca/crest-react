import * as React from 'react'
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { Tab, Tabs, Divider, Box, Typography, Tooltip } from '@mui/material';
import { loadBundleEventType } from './RequestBuilder'
import { Storage } from '../support/storage';

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
    
    console.log('HistoryTabContent')
    return (
        <List>
        {/* <List subheader={
            <TextField style={{paddingLeft: '10px', alignContent: 'flex-end'}} size='small' variant={RcUtils.defaultVariant} />
        }> */}
        
            {
                Storage.listBundles().map((bundle, index) => (
                    <Tooltip title={`${bundle.method} ${bundle.url} `} placement='right' enterDelay={0} leaveDelay={0}>
                    <ListItemButton key={index} onClick={() => {
                        document.dispatchEvent(new CustomEvent(loadBundleEventType, { detail: bundle }))    
                    }}>
                        <ListItemText primary={<Typography sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}>
                            {`${bundle.method} ${bundle.url} `}
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
                    <ListItemButton key={index} onClick={() => {
                        document.dispatchEvent(new CustomEvent(loadBundleEventType, { detail: bundle }))    
                    }}>
                        <ListItemText primary={<div style={{
                        }}>
                            {bundle.name}
                        </div>} />

                    </ListItemButton>
                ))
            }
        </List>)
}

const OAuthTabContent = () => {
    return (
        <List>
            {
                Storage.listOAuths().map((bundle, index) => (
                    <ListItemButton key={index} onClick={() => {
                        document.dispatchEvent(new CustomEvent(loadBundleEventType, { detail: bundle }))    
                    }}>
                        <ListItemText primary={<div style={{
                        }}>
                            {bundle.id}
                        </div>} />

                    </ListItemButton>
                ))
            }
        </List>)
}