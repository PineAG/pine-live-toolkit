import { ActionButton, Dialog, Flex, FormItem, Grid, HStack, Icons, Notification, Select, Switch, useLocalDBinding } from "@dualies/components"
import React, { useEffect, useRef, useState } from "react"
import { TransparentBackground } from "../components/backgrounds"
import { PanelElementSizeContext, PanelStoreContext, PreviewModeContext } from "../components/context"
import Loading from "../components/Loading"
import { KeepRatio } from "../components/panels/KeepRatio"
import { EditablePlugin, useEnabledPluginList, useEnabledPlugins } from "../components/plugins"
import { PanelInfo, Rect, usePanel } from "../backend"
import "./Panel.css"
import { usePanelId } from "./utils"


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

function AddPluginButton(props: {panel: PanelInfo}) {
    const enabledPluginsList = useEnabledPluginList()
    const enabledPlugins = useEnabledPlugins()
    const newPluginTypeBinding = useLocalDBinding<string | null>(null)
    return <>
        <ActionButton icon={<Icons.Add/>} onClick={() => newPluginTypeBinding.update(enabledPluginsList[0].type)}>添加组件</ActionButton>
        <Dialog title="添加组件" open={newPluginTypeBinding.value !== null} 
                onOk={async () => {
                    if(newPluginTypeBinding.value === null) return;
                    const plugin = enabledPlugins[newPluginTypeBinding.value]
                    await props.panel.createPlugin(plugin.type, {x: 0, y: 0, ...plugin.initialize.defaultSize()}, plugin.initialize.defaultConfig())
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
    </>
}


export const PanelPage = () => {
    const panelId = usePanelId()
    const panel = usePanel(panelId)
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
            <HStack layout={["1fr", "auto"]} className="route-panel-header">
                <Flex direction="vertical" alignment="space-between" nowrap>
                    <div style={{fontSize: "2rem"}}>{panel.meta.title}</div>
                </Flex>
                <Flex>
                    <Flex direction="horizontal" alignment="end" spacing={20} nowrap>
                        <AddPluginButton panel={panel}/>
                        <FormItem label="预览模式">
                            <Switch binding={previewModeBinding}/>
                        </FormItem>
                        <ShareButton/>
                    </Flex>
                </Flex>
            </HStack>
            <div className="route-panel-body" ref={ref}>
                <PanelStoreContext.Provider value={panel}>
                {panelBody}
                </PanelStoreContext.Provider>
            </div>
        </PreviewModeContext.Provider>
    </div>
}
