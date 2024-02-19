import './App.css';
import { RequestBuilder } from './components/RequestBuilder'
import { AppLayout } from './components/AppLayout';
import * as React from 'react';

function App() {
  const renderCounter  = React.useRef(0)
  console.log(`<App /> rendered ${++renderCounter.current} times`)
  return (
    // <RequestBuilder/>
    <AppLayout/>
  );
}

export default App;