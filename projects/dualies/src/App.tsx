import React from 'react';
import { RouterRoot } from './routes';
import { InternationalProvider } from '@dualies/components';
import {BackendProvider, BrowserStorageBackend, IBackend} from "./store"

import DualiesClient from '@dualies/client';

import features from './features.json';

function createBackend(): IBackend {
  if(features.Use_LocalStorage_Backend) {
    return new BrowserStorageBackend()
  } else {
    return new DualiesClient({path: "/api"})
  }
}

function App() {
  const backend = React.useMemo(createBackend, [])
  return (
    <BackendProvider value={backend}>
      <InternationalProvider language='zhCN'>
        <RouterRoot/>
      </InternationalProvider>
    </BackendProvider>
  );
}

export default App;
