import * as React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogContentText, Button, DialogActions, IconButton, styled, Paper } from '@mui/material';
import { useApplicationContext } from '../support/Context'
import CloseIcon from '@mui/icons-material/Close';
import { RcUtils } from '../support/RestClientUtils';

export type AppDialogStateType = {
    isOpen: boolean
    dividers: boolean
    title: string
    content: React.ReactElement
}

export const closedAppDialogState: AppDialogStateType = {
    isOpen: false,
    dividers: false,
    title: '',
    content: <></>
}

export const appDialogEventType = 'appDialogEvent'

// const BootstrapDialog = styled(Dialog)(({ theme }) => ({
//     '& .MuiDialogContent-root': {
//       padding: theme.spacing(2),
//     },
//     '& .MuiDialogActions-root': {
//       padding: theme.spacing(1),
//     }
//   }));
  
export const AppDialog = () => {
    const [appDialogState, setAppDialogState] = React.useState<AppDialogStateType>(closedAppDialogState);

    React.useEffect(() => {
        const handleAppDialogEvent: EventListener = (event) => {
            setAppDialogState((event as CustomEvent).detail as AppDialogStateType);
        };
        document.addEventListener(appDialogEventType, handleAppDialogEvent)
        // Cleanup function to remove the event listener when the component unmounts
        return () => {
            document.removeEventListener(appDialogEventType, handleAppDialogEvent)
        };
    }, []); // Empty dependency array to run the effect once on mount
    const appContext = useApplicationContext()//custom hook!

    React.useEffect(()=> {
        console.log('<App /> - init stuff goes in here when needed.')
      }, [])

    return (
        // based on this...
        // https://mui.com/material-ui/react-dialog/#customization
        <Dialog 
          open={appDialogState.isOpen} 
          onClose={appContext.hideDialog}
          PaperComponent={(props) => {
            return <Paper style={{position: "absolute", top:30}} {...props}/>
          }}
          >
            {appDialogState.title && <DialogTitle>{appDialogState.title}</DialogTitle>}
            <IconButton
            size={RcUtils.iconButtonSize}
          aria-label="close"
          onClick={appContext.hideDialog}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>            
            <DialogContent>
                {appDialogState.content}
                {/* <DialogContentText>{message}</DialogContentText> */}
            </DialogContent>
            {/* <DialogActions>
              <Button autoFocus onClick={appContext.hideDialog}>
                OK
              </Button> 
            </DialogActions>*/}
        </Dialog>
    )
}