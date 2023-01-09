import { ActionButton, DBinding, Dialog, Flex, FormItem, Grid, HStack, Icons, Notification, Select, Switch, useLocalDBinding } from "@pltk/components"
import { PanelIdProvider, useLiveToolkitClient, usePanel, usePanelId, useWidgetListOfPanel, WidgetProvider } from "../backend"
import { TransparentBackground } from "../components/backgrounds"
import { PreviewModeContext } from "../components/context"
import { KeepRatio } from "../components/panels/KeepRatio"
import { EditableWidget, useEnabledWidgetList, useEnabledWidgets } from "../components/widgets"
import { unwrapAsyncSubs } from "../components/subs"
import "./Panel.css"
import { usePanelIdFromParams } from "./utils"

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

function AddPluginButton() {
    const panelId = usePanelId()
    const client = useLiveToolkitClient()
    const enabledPluginsList = useEnabledWidgetList()
    const enabledPlugins = useEnabledWidgets()
    const newPluginTypeBinding = useLocalDBinding<string | null>(null)
    return <>
        <ActionButton icon={<Icons.Add/>} onClick={() => newPluginTypeBinding.update(enabledPluginsList[0].type)}>添加组件</ActionButton>
        <Dialog title="添加组件" open={newPluginTypeBinding.value !== null} 
                onOk={async () => {
                    if(newPluginTypeBinding.value === null) return;
                    const plugin = enabledPlugins[newPluginTypeBinding.value]
                    await client.createWidget<any>(panelId, {
                        meta: {type: plugin.type},
                        rect: {
                            x: 0, y: 0,
                            ...plugin.initialize.defaultSize()
                        },
                        config: plugin.initialize.defaultConfig()
                    })
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

function PanelHeader({previewModeBinding}: {previewModeBinding: DBinding<boolean>}) {
    const panelReq = usePanel()
    return unwrapAsyncSubs(panelReq, panel => (
        <HStack layout={["1fr", "auto"]} className="route-panel-header">
            <Flex direction="vertical" alignment="space-between" nowrap>
                <div style={{fontSize: "2rem"}}>{panel.meta.title}</div>
            </Flex>
            <Flex>
                <Flex direction="horizontal" alignment="end" spacing={20} nowrap>
                    <AddPluginButton/>
                    <FormItem label="预览模式">
                        <Switch binding={previewModeBinding}/>
                    </FormItem>
                    <ShareButton/>
                </Flex>
            </Flex>
        </HStack>
    ))
}

function WidgetContainer() {
    const panelReq = usePanel()
    const widgetsReq = useWidgetListOfPanel()
    return unwrapAsyncSubs(panelReq, panel => {
        return unwrapAsyncSubs(widgetsReq, widgets => {
            return <div className="route-panel-body">
                <KeepRatio internalSize={panel.size}>
                    <TransparentBackground/>
                    <>
                    {widgets.map(widget => (
                        <WidgetProvider value={widget} key={widget.id}>
                            <EditableWidget
                                widget={widget}
                            />
                        </WidgetProvider>
                    ))}
                    </>
                </KeepRatio>
            </div>
        })
    })
}


export const PanelPage = () => {
    const panelId = usePanelIdFromParams()
    const previewModeBinding = useLocalDBinding(false)
    return <div className="route-panel-root">
        <PanelIdProvider value={panelId}>
            <PreviewModeContext.Provider value={previewModeBinding.value}>
                <PanelHeader previewModeBinding={previewModeBinding}/>
                <WidgetContainer/>
            </PreviewModeContext.Provider>
        </PanelIdProvider>
    </div>
}
