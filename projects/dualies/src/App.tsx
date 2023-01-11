import React, { useState } from 'react';

import features from './features.json';
import { BackendOptions, DualiesApp } from './ui';
import builtinPlugins from './plugins';
import { DangerLink, Dialog, Icons, QuickConfirm } from '@pltk/components';
import { clearIndexedDBBackendData, createIndexedDBBackend } from '@pltk/indexdb-backend';
import { createRestfulBackend } from '@pltk/restful-backend-client';

function createBackend(): BackendOptions {
  if(features.Use_LocalStorage_Backend) {
    return createIndexedDBBackend()
  } else {
    return createRestfulBackend()
  }
}

function App() {
  const backend = React.useMemo(createBackend, [])
  return <>
    <DualiesApp
      language='zhCN'
      backend={backend}
      plugins={builtinPlugins}
    />
    <DemoMessage/>
  </>;
}

function DemoMessage() {
  const [open, setOpen] = useState(!window.location.hash.includes("panel"))
  if(!features.Show_Demo_Message) {
    return <></>;
  }
  async function onClearData(){
    await clearIndexedDBBackendData()
    setOpen(false)
  }
  return <Dialog
    title="使用提示"
    open={open}
    onOk={setOpen.bind(null, false)}
    onCancel={setOpen.bind(null, false)}
  >
    <div>
    <p>感谢尝试Pine的直播工具包！</p>
    <p>本页面提供了UI的大部分功能，数据存储及跨页面同步通过浏览器机制实现，所有数据都保存在您的浏览器本地，在不同浏览器、不同设备之间无法共享数据，敬请留意。</p>
    <p>如果您在FireFox中使用Multi-Account Containers插件，请注意数据只能在同一身份的标签页之间共享。</p>
    <p>隐私模式下可能无法正常读写数据。</p>
    <p>
      如因数据格式变更而无法正常显示，或担心浏览器空间占用问题，可以尝试删除保存的数据：
      <QuickConfirm title="清除所有数据" description="将删除所有浏览器中保存的数据，包括面板内容及布局等。" onConfirm={onClearData}>
        <DangerLink icon={<Icons.Delete/>}>清除所有数据</DangerLink>
      </QuickConfirm>
    </p>
    </div>
  </Dialog>
}

export default App;
