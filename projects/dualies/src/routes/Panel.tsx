import { TransparentBackground } from "../components/backgrounds"
import Loading from "../components/Loading"
import { KeepRatio } from "../components/panels/KeepRatio"
import { EditablePlugin } from "../components/plugins"
import { Rect, usePanel } from "../store"
import { usePanelId } from "./utils"
import "./Panel.css"
import { PanelElementSizeContext, PanelStoreContext, PreviewModeContext } from "../components/context"
import React, { useEffect, useRef, useState } from "react"
import { enabledPlugins, enabledPluginsList } from "../plugins"
import {ActionButton, Switch, Dialog, FormItem, Grid, Icons, Notification, Select, useLocalDBinding, Stack} from "@dualies/components"


function convertDomRectToRect(rect: DOMRect | undefined): Rect {
    if(rect === undefined) {
        return {x: 0, y: 0, width: 1, height: 1}
    }
    const {width, height, x, y} = rect
    return {width, height, x, y}
}

function ShareButton() {
    const displayNotification = useLocalDBinding(false)
    async function copyLink() {
        const url = `${window.location.href}/exhibition`
        await navigator.clipboard.writeText(url)
        displayNotification.update(true)
    }
    return <>
        <ActionButton icon={<Icons.Share/>} onClick={copyLink}>
            展示页链接
        </ActionButton>
        <Notification
            title="已复制展示页链接"
            binding={displayNotification}
        />
    </>
}


export const PanelPage = () => {
    const panelId = usePanelId()
    const panel = usePanel(panelId)
    const newPluginTypeBinding = useLocalDBinding<string | null>(null)
    const ref = useRef<HTMLDivElement>(null)
    const [panelBody, setPanelBody] = useState<React.ReactElement | null>(null)
    const previewModeBinding = useLocalDBinding(false)
    useEffect(() => {
        if(panel && ref.current) {
            setPanelBody(createPanelBody(ref.current))
        }
    }, [panelId, !!panel, !!ref.current])
    const createPanelBody = (element: HTMLDivElement) => {
        if(!panel) return null;
        return <PanelElementSizeContext.Provider value={convertDomRectToRect(element.getBoundingClientRect())}>
            <KeepRatio internalSize={panel.size}>
                <TransparentBackground/>
                <>
                {panel.pluginsList.map(pluginId => (
                    <EditablePlugin
                        key={pluginId}
                        panelId={panelId}
                        pluginId={pluginId}
                    />
                ))}
                </>
            </KeepRatio>
        </PanelElementSizeContext.Provider>
    }
    
    if(!panel){
        return <Loading/>
    }
    return <div className="route-panel-root">
        <PreviewModeContext.Provider value={previewModeBinding.value}>
            <Grid container className="route-panel-header" alignment="left">
                <Grid span={6}>
                    <div style={{fontSize: "2rem"}}>{panel.meta.title}</div>
                </Grid>
                <Grid span={6}>
                    <Stack direction="horizontal" alignment="evenly">
                        <ActionButton icon={<Icons.Add/>} onClick={() => newPluginTypeBinding.update(enabledPluginsList[0].type)}>添加组件</ActionButton>
                        <FormItem label="预览模式">
                            <Switch binding={previewModeBinding}/>
                        </FormItem>
                        <ShareButton/>
                    </Stack>
                </Grid>
            </Grid>
            <div className="route-panel-body" ref={ref}>
                <PanelStoreContext.Provider value={panel}>
                {panelBody}
                </PanelStoreContext.Provider>
            </div>
        </PreviewModeContext.Provider>
        <Dialog title="添加组件" open={newPluginTypeBinding.value !== null} 
                onOk={async () => {
                    if(newPluginTypeBinding.value === null) return;
                    const plugin = enabledPlugins[newPluginTypeBinding.value]
                    await panel.createPlugin(plugin.type, {x: 0, y: 0, ...plugin.initialize.defaultSize()}, plugin.initialize.defaultConfig())
                    newPluginTypeBinding.update(null)
                }} 
                onCancel={() => newPluginTypeBinding.update(null)}>
            <Grid container>
                <Grid span={12}>
                    <FormItem label="组件类型">
                        <Select
                            binding={newPluginTypeBinding}
                            options={enabledPluginsList.map(plugin => ({
                                value: plugin.type,
                                label: plugin.title
                            }))}
                        />
                    </FormItem>
                </Grid>
            </Grid>
        </Dialog>
    </div>
}
