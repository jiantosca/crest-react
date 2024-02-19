import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
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
import { RequestBuilder } from './RequestBuilder'
import { Collapse, FormControlLabel, ListSubheader, Stack, Switch } from '@mui/material';
import { HttpResponse } from './HttpResponse';
import { TempUtils } from '../support/TempUtils';
import { RcUtils } from '../support/RestClientUtils';
import { DarkMode, ExpandLess, ExpandMore, Http, ManageHistory } from '@mui/icons-material';

const drawerWidth = 260; //240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

export const AppLayout = () => {
  const renderCounter = React.useRef(0)
  console.log(`<AppLayout /> rendered ${++renderCounter.current} times`)

  const theme = useTheme();
  const [open, setOpen] = React.useState(true);
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };
  const isDrawerOpen = () => {
    return open;
  }

  const [historyOpen, setHistoryOpen] = React.useState(false);

  const toggleHistory = () => {
    setHistoryOpen(!historyOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List subheader={<ListSubheader>Tools</ListSubheader>}>
          {['Clear', 'Clone', 'Load'].map((text, index) => (
            <ListItem key={text} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  {index % 2 === 0 ? <InboxIcon/> : <MailIcon />}
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
                <DarkMode/>
              </ListItemIcon>
              <ListItemText id="switch-list-label-darkmode" primary="Dark Mode" />
              <Switch edge='end' size={RcUtils.defaultSize}
                inputProps={{
                  'aria-labelledby': 'switch-list-label-wifi'
              }}/>
            </ListItem>

            <ListItem>
              <FormControlLabel label="Line Numbers"
              control={<Switch size={RcUtils.defaultSize}/>} />
            </ListItem>
            <ListItem>
              <FormControlLabel label="Word Wrap"
              control={<Switch size={RcUtils.defaultSize}/>} />
            </ListItem>                             
        </List>
      </Drawer>
      <Main open={open} sx={{ p: 0, border: '0px solid black' }}>
        <RequestBuilder isDrawerOpen={isDrawerOpen} handleDrawerOpen={handleDrawerOpen} handleDrawerClose={handleDrawerClose} />
        <Stack rowGap={2.5}>
          <HttpResponse exchange={TempUtils.httpExchangeContext1}></HttpResponse>
          <HttpResponse exchange={TempUtils.httpExchangeContext2}></HttpResponse>
        </Stack>
      </Main>
    </Box>
  );
}