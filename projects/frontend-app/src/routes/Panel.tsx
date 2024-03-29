import { ActionButton, DBinding, Dialog, Flex, FormItem, Grid, HStack, Icons, Select, Switch, useLocalDBinding, CopyableInput, IconButton, ButtonProps, Button, StringField, Tooltip, LiteDangerButton, QuickConfirm, defaultValueBinding, NumberField, propertyBinding, unwrapAsyncSubs, useNullableContext, createNullableContext, Divider, Collapse } from "@pltk/components"
import { PanelIdProvider, useLiveToolkitClient, usePanel, usePanelId, useWidgetListOfPanel, WidgetConfigInternalProvider, WidgetProvider } from "@pltk/core"
import { TransparentBackground } from "../components/backgrounds"
import { PreviewModeContext } from "../components/context"
import { KeepRatio } from "../components/panels/KeepRatio"
import { EditableWidget } from "../components/widgets"
import "./Panel.css"
import { usePanelIdFromParams } from "./utils"
import { IPanel, Size } from "@pltk/protocol"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useEnabledWidgetList, useEnabledWidgets } from "@pltk/core"

function ShareButton() {
    return <FormItem label="展示页链接">
        <CopyableInput
            value={`${window.location.href}/exhibition`}
            successMessage="已复制展示页链接"
        />
    </FormItem>
}

function AddPluginButton() {
    const showDialog = useLocalDBinding(false)
    return <>
        <ActionButton icon={<Icons.Add/>} onClick={() => showDialog.update(true)}>添加组件</ActionButton>
        <AddPluginDialogInternal showDialog={showDialog}/>
    </>
}

function AddPluginDialogInternal(props: {showDialog: DBinding<boolean>, }) {
    const panelId = usePanelId()
    const client = useLiveToolkitClient()
    const enabledWidgetsList = useEnabledWidgetList()
    const enabledWidgets = useEnabledWidgets()
    const currentWidgetType = useLocalDBinding(enabledWidgetsList[0].type)
    const tmpConfig = useLocalDBinding<any>(undefined)

    useEffect(() => {
        if(props.showDialog.value) {
            const w = enabledWidgetsList[0]
            currentWidgetType.update(w.type)
            tmpConfig.update(w.initialize.defaultConfig())
        }
    }, [props.showDialog.value])

    useEffect(() => {
        const w = enabledWidgets[currentWidgetType.value]
        tmpConfig.update(w.initialize.defaultConfig())
    }, [currentWidgetType.value])

    async function create() {
        const widget = enabledWidgets[currentWidgetType.value]
        await client.createWidget<any>(panelId, {
            meta: {type: widget.type},
            rect: {
                x: 0, y: 0,
                ...widget.initialize.defaultSize()
            },
            config: tmpConfig.value
        })
        await props.showDialog.update(false)
    }

    const currentWidget = enabledWidgets[currentWidgetType.value]

    return <Dialog title="添加组件" open={props.showDialog.value} 
            onOk={create} 
            onCancel={() => props.showDialog.update(false)}>
        <FormItem label="组件类型">
            <Select
                binding={currentWidgetType}
                options={enabledWidgetsList.map(plugin => ({
                    value: plugin.type,
                    label: plugin.title
                }))}
            />
        </FormItem>
        <Collapse title={`设置 ${currentWidget.title}`}>
            <WidgetConfigInternalProvider configBinding={tmpConfig}>
                {currentWidget.render.config()}
            </WidgetConfigInternalProvider>
        </Collapse>
    </Dialog>
}

function IconBtn(props: ButtonProps) {
    return <IconButton size="large" {...props}/>
}

function PanelTitle() {
    const navigate = useNavigate()
    const panelId = usePanelId()
    const client = useLiveToolkitClient()
    const panel = useNullableContext(PanelInfoContext)
    const [newTitle, setNewTitle] = useState<null | string>(null)
    if(newTitle === null) {
        return <>
            <IconBtn icon={<Icons.Home/>} onClick={() => navigate("/")}/>
            <div style={{fontSize: "1.5rem"}}>{panel.meta.title}</div>
            <IconBtn icon={<Icons.Edit/>} onClick={() => setNewTitle(panel.meta.title)}/>
        </>
    } else {
        const binding: DBinding<string> = {value: newTitle, update: async s => setNewTitle(s)}
        return <>
            <StringField binding={binding}/>
            <IconBtn icon={<Icons.Save/>} onClick={async () => {
                await client.setPanelMeta(panelId, {...panel.meta, title: newTitle})
                setNewTitle(null)
            }}/>
            <IconBtn icon={<Icons.Close/>} onClick={() => setNewTitle(null)}/>
        </>
    }
}

function ResizePanel() {
    const panelId = usePanelId()
    const panel = useNullableContext(PanelInfoContext)
    const client = useLiveToolkitClient()
    const newSizeBinding = useLocalDBinding<null | Size>(null)
    const notNullSize = defaultValueBinding<Size>(newSizeBinding, {width: 0, height: 1})
    return <>
        <Button icon={<Icons.Move/>} onClick={() => newSizeBinding.update(panel.size)}>设置面板尺寸</Button>
        <Dialog title="设置面板尺寸" open={newSizeBinding.value !== null}
            onOk={async () => {
                if(newSizeBinding.value !== null) {
                    await client.setPanelSize(panelId, newSizeBinding.value)
                    await newSizeBinding.update(null)
                }
            }}
            onCancel={() => newSizeBinding.update(null)}>
                <Flex direction="horizontal" alignment="center" spacing={20}>
                    <FormItem label="宽度">
                        <NumberField binding={propertyBinding(notNullSize, "width")}/>
                    </FormItem>
                    <FormItem label="高度">
                        <NumberField binding={propertyBinding(notNullSize, "height")}/>
                    </FormItem>
                </Flex>
        </Dialog>
    </>
}

function DeletePanelButton() {
    const navigate = useNavigate()
    const panelId = usePanelId()
    const client = useLiveToolkitClient()
    async function onDelete() {
        await client.deletePanel(panelId)
        navigate("/")
    }
    return <QuickConfirm title="删除面板" description="删除后无法恢复" onConfirm={onDelete}>
        <LiteDangerButton icon={<Icons.Delete/>}>删除面板</LiteDangerButton>
    </QuickConfirm>
}

function PanelInfo() {
    return <Flex direction="vertical" alignment="start" nowrap spacing={10}>
        <Flex direction="horizontal" alignment="start" nowrap spacing={5}>
            <PanelTitle/>
        </Flex>
        <Flex direction="horizontal" alignment="start" nowrap spacing={5}>
            <ResizePanel/>
            <DeletePanelButton/>
        </Flex>
    </Flex>
}

const PanelInfoContext = createNullableContext<IPanel>("Panel meta not initialized")

function WidgetsPanel() {
    const previewModeBinding = useNullableContext(PreviewModeBindingContext)
    return (<Flex direction="vertical" spacing={16}>
        <ShareButton/>
        <Flex direction="horizontal" alignment="end" spacing={20} nowrap>
            <AddPluginButton/>
            <FormItem label="预览模式">
                <Switch binding={previewModeBinding}/>
            </FormItem>
        </Flex>
    </Flex>)
}

function PanelHeader() {
    const panelId = usePanelId()
    const panelReq = usePanel(panelId)
    return (
        <HStack layout={["1fr", "auto"]} className="route-panel-header" spacing={20}>
            {unwrapAsyncSubs(panelReq, panel => (
                <PanelInfoContext.Provider value={panel}>
                    <PanelInfo/>
                </PanelInfoContext.Provider>
            ))}
            <WidgetsPanel/>
        </HStack>
    )
}

function WidgetContainer() {
    const panelId = usePanelId()
    const panelReq = usePanel(panelId)
    const widgetsReq = useWidgetListOfPanel(panelId)
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

const PreviewModeBindingContext = createNullableContext<DBinding<boolean>>("Preview mode binding not initialized.")

export const PanelPage = () => {
    const panelId = usePanelIdFromParams()
    const previewModeBinding = useLocalDBinding(false)
    return <div className="route-panel-root">
        <PanelIdProvider value={panelId}>
            <PreviewModeBindingContext.Provider value={previewModeBinding}>
                <PanelHeader/>
            </PreviewModeBindingContext.Provider>
            <PreviewModeContext.Provider value={previewModeBinding.value}>
                <WidgetContainer/>
            </PreviewModeContext.Provider>
        </PanelIdProvider>
    </div>
}
