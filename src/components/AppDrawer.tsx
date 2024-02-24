import * as React from 'react'
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import { Collapse, FormControlLabel, ListSubheader, Switch } from '@mui/material';
import { ExpandLess, ExpandMore, ManageHistory } from '@mui/icons-material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import { styled, useTheme } from '@mui/material/styles';
import { useDrawerContext } from '../support/Context';
import { RcUtils } from '../support/RestClientUtils';

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  }));

export const AppDrawer = () => {
    
    const theme = useTheme();
    const [historyOpen, setHistoryOpen] = React.useState(false);
    const toggleHistory = () => {
      setHistoryOpen(!historyOpen);
    };
    
    const drawerState = useDrawerContext()

    return (
        <Drawer
            sx={{
                width: drawerState.width,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerState.width,
                    boxSizing: 'border-box',
                },
            }}
            variant="persistent"
            anchor="left"
            open={drawerState.isOpen}
            transitionDuration={0}
        >
            <DrawerHeader>
                <IconButton onClick={drawerState.toggleDrawer}>
                    {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                </IconButton>
            </DrawerHeader>
            <Divider />
            <List subheader={<ListSubheader>Tools</ListSubheader>}>
                {['Clear', 'Clone', 'Load'].map((text, index) => (
                    <ListItem key={text} disablePadding>
                        <ListItemButton>
                            <ListItemIcon>
                                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                            </ListItemIcon>
                            <ListItemText primary={text} />
                        </ListItemButton>
                    </ListItem>
                ))}
                <>
                    <ListItemButton onClick={toggleHistory}>
                        <ListItemIcon>
                            <ManageHistory />
                        </ListItemIcon>
                        <ListItemText primary="History" />
                        {historyOpen ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={historyOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <ListItemButton sx={{ pl: 4 }}>
                                <ListItemText primary="Call One Abc 124" />
                            </ListItemButton>
                            <ListItemButton sx={{ pl: 4 }}>
                                <ListItemText primary="Call Two" />
                            </ListItemButton>
                            <ListItemButton sx={{ pl: 4 }}>
                                <ListItemText primary="Call Three" />
                            </ListItemButton>
                            <ListItemButton sx={{ pl: 4 }}>
                                <ListItemText primary="Call Four" />
                            </ListItemButton>
                        </List>
                    </Collapse>
                </>
            </List>
            <Divider />
            <List subheader={<ListSubheader>Settings</ListSubheader>}>
                <ListItem>
                    <ListItemIcon>
                        <Brightness4Icon />
                    </ListItemIcon>
                    <ListItemText id="switch-list-label-darkmode" primary="Dark Mode" />
                    <Switch edge='end' size={RcUtils.defaultSize}
                        checked={drawerState.isDarkMode} onChange={drawerState.toggleDarkMode}
                        inputProps={{
                            'aria-labelledby': 'switch-list-label-darkmode'
                        }} />
                </ListItem>

                <ListItem>
                    <FormControlLabel label="Line Numbers"
                        control={<Switch size={RcUtils.defaultSize} />} />
                </ListItem>
                <ListItem>
                    <FormControlLabel label="Word Wrap"
                        control={<Switch size={RcUtils.defaultSize} />} />
                </ListItem>
            </List>
        </Drawer>
    )
}