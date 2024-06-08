import * as React from 'react'
import { RcUtils } from '../support/rest-client-utils';
import { Typography } from '@mui/material'

/**
 * This component is responsible for rendering the version of the extension. It will first try to get the version
 * from the manifest.json file if it's running as a web app, otherwise it will get the version from the chrome
 * runtime object.
 * 
 * react comps can't be async which is required when using fetch so we have to use a useEffect hook with a state
 * variable to hold the version.
 * 
 * @returns Version component
 */
export const Version = () => {
  const [version, setVersion] = React.useState(''); // default version

  React.useEffect(() => {
    const getVersion = async () => {
      if (RcUtils.isExtensionRuntime()) {
        return `v${chrome.runtime.getManifest().version}`
      }

      try {
        const response = await fetch('/manifest.json');
        const manifest = await response.json();
        return `v${manifest.version}`;
      } catch (error) {
        console.error('Failed to fetch manifest:', error);
        return '(version lookup failed)';
      }
    }

    getVersion().then(setVersion);
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <Typography pl={2} variant='caption' color='gray'>
      {version}
    </Typography>
  )
}