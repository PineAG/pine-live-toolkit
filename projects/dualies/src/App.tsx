import React from 'react';
import { RouterRoot } from './routes';
import { InternationalProvider } from '@dualies/components';

function App() {
  return (
    <InternationalProvider language='zhCN'>
      <RouterRoot/>
    </InternationalProvider>
  );
}

export default App;
