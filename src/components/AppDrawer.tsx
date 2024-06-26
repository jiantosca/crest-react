import * as React from 'react'
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import WrapTextIcon from '@mui/icons-material/WrapText';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import { Alert, Box, Button, Switch, TextField, Collapse } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import { useApplicationContext } from '../support/react-contexts';
import { RcUtils } from '../support/rest-client-utils';
import { AppSettings } from '../support/settings';
import { AppDrawerTabs } from './AppDrawerTabs';
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export const AppDrawer = () => {
    const renderCounter = React.useRef(0)
    console.log(`<AppDrawer /> rendered ${++renderCounter.current} times`)

    const appState = useApplicationContext()

    return (
        <Drawer
            sx={{
                width: appState.drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: appState.drawerWidth,
                    boxSizing: 'border-box',
                },
            }}
            variant="persistent"
            anchor="left"
            open={appState.isDrawerOpen}
            transitionDuration={0}
        >

            <AppDrawerTabs />
            
            <Divider />

            {/* we'll give key as unique value so we render new comp instead of rerendering the same comp. This is to ensure we repopulate all settings
            when they're updated in a different tab. App.tsx has storage listener so we can keep settings in sync across tabs, so when one tab updates
            them we want it reflected in all tabs */}
            <AppDrawerSettings key={renderCounter.current}/>

        </Drawer>
    )
}

const AppDrawerSettings = () => {
    const renderCounter = React.useRef(0)
    console.log(`<AppDrawerSettings /> rendered ${++renderCounter.current} times`)

    const appState = useApplicationContext()

    // unlike darkmode toggle that uses the more global drawerState that has darkMode attribute, we'll just use a local state for this. For 
    // word wrap we don't want to trigger app wide rerender, we just want to update settings that any future responses would use. Existing
    // responses would maintain their current word wrap setting. Note that each response card has its own word wrap button to control it
    // at the response level.
    const [wordWrap, setWordWrap] = React.useState<boolean>(AppSettings.isWordWrap())
    const toggleWordWrap = () => {
        const toggled = AppSettings.toggleWordWrap()
        setWordWrap(toggled)
    }

    const validateNumber = (value: string) => {
        const regex = /^[0-9]+$/
        if (value.trim() === '') {
            return true
        } else {
            return regex.test(value)
        }
    }

    const updateTimeout = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!validateNumber(event.target.value)) {
            appState.showDialog('Invalid Number', <Alert severity="error">You should only enter numbers in the Timeout input.</Alert>)
            return
        }
        const timeout = parseInt(event.target.value)
        AppSettings.setServiceTimeout(timeout)
    }

    const updateHistoryLimit = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!validateNumber(event.target.value)) {
            appState.showDialog('Invalid Number', <Alert severity="error">You should only enter numbers in the History Limit input.</Alert>)
            return
        }
        const historyLimit = parseInt(event.target.value)
        AppSettings.setHistoryLimit(historyLimit)
    }

    const updatePrettyPrintBytesLimit = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!validateNumber(event.target.value)) {
            appState.showDialog('Invalid Number', <Alert severity="error">You should only enter numbers in the Pretty Print Limit input.</Alert>)
            return
        }
        const prettyPrintBytesLimit = parseInt(event.target.value)
        AppSettings.setPrettyPrintBytesLimit(prettyPrintBytesLimit)
    }

    const [settingsOpen, setSettingsOpen] = React.useState(AppSettings.isSettingsOpen());
    const toggleSettings = () => {
        const toggled = AppSettings.toggleSettings()
        setSettingsOpen(toggled)
    };

    const padLeft = 2;

    return (
        <List>
        <ListItemButton onClick={toggleSettings}>
            <ListItemIcon>
                <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
            {settingsOpen ? <ExpandMoreIcon /> : <ExpandLessIcon /> }
        </ListItemButton>
        <Collapse in={settingsOpen} timeout="auto">
            <ListItem sx={{ pl: padLeft }}>
                <ListItemIcon><Brightness4Icon /></ListItemIcon>
                <ListItemText id="switch-list-label-darkmode" primary="Dark Mode" />
                <Switch edge='end' size={RcUtils.defaultSize}
                    checked={appState.isDarkMode} onChange={appState.toggleDarkMode}
                    inputProps={{ 'aria-labelledby': 'switch-list-label-darkmode' }} />
            </ListItem>

            <ListItem sx={{ pl: padLeft }}>
                <ListItemIcon><WrapTextIcon /></ListItemIcon>
                <ListItemText id="switch-list-label-wordwrap" primary="Word Wrap" />
                <Switch edge='end' size={RcUtils.defaultSize}
                    checked={wordWrap} onChange={toggleWordWrap}
                    inputProps={{ 'aria-labelledby': 'switch-list-label-wordwrap' }} />
            </ListItem>
            <ListItem key='urlAndHeaderHistory' disablePadding>
                <ListItemButton disableRipple sx={{
                    pl: padLeft,
                    cursor: 'default',
                    '&:hover': {
                        backgroundColor: 'transparent',
                    },
                }}>
                    <ListItemIcon><ManageHistoryIcon /></ListItemIcon>
                    <Box display="flex" justifyContent="space-between" width="100%">
                        <Button disabled variant='outlined'>URLs</Button>
                        <Button disabled variant='outlined'>Headers</Button>
                        {/* <ListItemText primary={<Button variant='outlined'>URLs</Button>} />
                    <ListItemText primary={<Button variant='outlined'>Headers</Button>} /> */}
                    </Box>
                </ListItemButton>
            </ListItem>
            <ListItem sx={{ pl: padLeft }}>

                <TextField variant="standard" size="small" type="text" label="Timeout" sx={{ width: '30%' }}
                    onChange={updateTimeout}
                    defaultValue={AppSettings.getServiceTimeout()} />

                <TextField variant="standard" size="small" type="text" label="Highlight Limit" sx={{ ml: 2, width: '40%' }}
                    onChange={updatePrettyPrintBytesLimit}
                    defaultValue={AppSettings.getPrettyPrintBytesLimit()} />

                <TextField disabled variant="standard" size="small" type="text" label="History Limit" sx={{ ml: 2, width: '30%' }}
                    onChange={updateHistoryLimit}
                    defaultValue={AppSettings.getHistoryLimit()} />

            </ListItem>
        </Collapse>
    </List>    )
  }