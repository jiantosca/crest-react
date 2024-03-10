import * as React from 'react'
import { Dialog, DialogTitle, DialogContent, IconButton, Paper } from '@mui/material';
import { useApplicationContext } from '../support/Context'
import CloseIcon from '@mui/icons-material/Close';
import { RcUtils } from '../support/RestClientUtils';

/**
 * Holds some state we want for the dialog, also used as the detail attribute of the CustomEvent
 */
export type AppDialogStateType = {
  isOpen: boolean
  dividers: boolean
  title: string
  content: React.ReactElement
}

/**
 * Default/hidden state for the dialog
 */
export const closedAppDialogState: AppDialogStateType = {
  isOpen: false,
  dividers: false,
  title: '',
  content: <></>
}

/**
 * even type for the dialog used for listening/firing the CustomEvent
 */
export const appDialogEventName = 'appDialogEvent'

/**
 * A common dialog for the app. It listens for for a CustomEvent with the name 'appDialogEvent' having a
 * detail attribute of type AppDialogStateType. When the event is received it's state is set
 * from the detail attribute allowing various components in the app to open/close/populate the dialog.
 * 
 * As of this writing, the only component that uses this is the RequestSender component in the RequestBuilder
 * to nontify the user of some validation errors (like bad url, bad headers, etc), or to indicate the request
 * they send timed out, or the server didn't respond. 
 * 
 * @returns 
 */
export const AppDialog = () => {
  const [appDialogState, setAppDialogState] = React.useState<AppDialogStateType>(closedAppDialogState);

  React.useEffect(() => {
    const handleAppDialogEvent: EventListener = (event) => {
      setAppDialogState((event as CustomEvent).detail as AppDialogStateType)
    }
    document.addEventListener(appDialogEventName, handleAppDialogEvent)
    // Cleanup function to remove the event listener when the component unmounts
    return () => {
      document.removeEventListener(appDialogEventName, handleAppDialogEvent)
    }
  }, []); // Empty dependency array to run the effect once on mount

  const appContext = useApplicationContext()

  return (
    // based on this...
    // https://mui.com/material-ui/react-dialog/#customization
    <Dialog
      open={appDialogState.isOpen}
      onClose={appContext.hideDialog}
      PaperComponent={(props) => {
        return <Paper style={{ position: "absolute", top: 30 }} {...props} />
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
      </DialogContent>
    </Dialog>
  )
}