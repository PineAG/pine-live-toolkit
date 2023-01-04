import React from 'react';
import DualiesClient from '@dualies/client';

import features from './features.json';
import { BrowserStorageBackend, DualiesApp, IBackend } from './ui';
import builtinPlugins from './plugins';

function createBackend(): IBackend {
  if(features.Use_LocalStorage_Backend) {
    return new BrowserStorageBackend()
  } else {
    return new DualiesClient({path: "/api"})
  }
}

function App() {
  const backend = React.useMemo(createBackend, [])
  return <DualiesApp
    language='zhCN'
    backend={backend}
    plugins={builtinPlugins}
  />;
}

export default App;
