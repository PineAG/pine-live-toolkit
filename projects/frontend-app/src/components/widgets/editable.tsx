import { Dialog, Flex, IconButton, Icons, QuickConfirm, unwrapAsyncBinding, unwrapAsyncSubs, useLocalDBinding, useNullableContext } from "@pltk/components"
import { Rect, Size } from "@pltk/protocol"
import React, { CSSProperties, ReactNode, useContext } from "react"
import { useCachedDataProvider, useLiveToolkitClient, usePanelId, useWidgetConfigBinding, useWidgetId, useWidgetMeta, useWidgetRectBinding } from "@pltk/core"
import { useEnabledWidgets, WidgetDefinition } from "@pltk/core"
import { EditableStateContext, PanelSizeContext, PreviewModeContext } from "../context"
import { EditableState } from "./base"
import { ResizableFramework, ScaledFramework } from "./frameworks"

export interface EditableBodyRenderer {
    preview: () => ReactNode
    edit: () => ReactNode
    move: () => ReactNode
}

function getEditableSwitchStyle(pluginSize: Rect, panelSize: Size): [CSSProperties, boolean] {
    const pluginCenterX = pluginSize.x + pluginSize.width / 2
    const pluginCenterY = pluginSize.y + pluginSize.height / 2
    const panelCenterX = panelSize.width / 2
    const panelCenterY = panelSize.height / 2
    const left = pluginCenterX < panelCenterX
    const top = pluginCenterY < panelCenterY
    const style: CSSProperties = {position: "absolute"}
    style[left ? "right" : "left"] = 0
    style[top ? "top" : "bottom"] = "100%"
    return [style, !left]
}

interface ButtonProps {
    widgetDef: WidgetDefinition<any>
}

export function DeleteButton(props: ButtonProps) {
    const client = useLiveToolkitClient()
    const panelId = usePanelId()
    const widgetId = useWidgetId()
    return <QuickConfirm title="删除组件" description="确认要删除组件吗？" onConfirm={() => client.deleteWidget(panelId, widgetId)}>    
        <IconButton size="middle" icon={<Icons.Delete/>}/>
    </QuickConfirm>
}

export function EditButton(props: ButtonProps) {
    const showDialog = useLocalDBinding<boolean>(false)
    const cacheConfigReq = useCachedDataProvider()
    return unwrapAsyncSubs(cacheConfigReq, ([TmpProvider, saveConfig, isConfigDirty]) => {
        return <>
            <IconButton onClick={() => showDialog.update(true)} size="middle">
                <Icons.Edit/>
            </IconButton>
            <Dialog 
                    title={`设置组件 ${props.widgetDef.title}`}
                    onOk={async () => {
                        await saveConfig()
                        await showDialog.update(false)
                    }}
                    disableOk={!isConfigDirty}
                    onCancel={() => showDialog.update(false)}
                    open={showDialog.value}>
                    <>
                        <TmpProvider>
                            {props.widgetDef.render.config()}
                        </TmpProvider>
                    </>
            </Dialog>
        </>
    })
    
}


export const EditableSwitch = () => {
    const editableStateBinding = useContext(EditableStateContext);
    const panelId = usePanelId()
    const widgetId = useWidgetId()
    const rectBindingReq = useWidgetRectBinding(panelId, widgetId)
    const {configSize} = useNullableContext(PanelSizeContext)
    const enabledWidgets = useEnabledWidgets()
    const meta = useWidgetMeta()

    const widgetDef = enabledWidgets[meta.type]
    
    return unwrapAsyncBinding(rectBindingReq, rectBinding => {
        const [style, reverse] = getEditableSwitchStyle(rectBinding.value, configSize)
        if(editableStateBinding.value === EditableState.Edit) {
            return <>
            <Flex style={style} nowrap reverse={reverse}>
                <DeleteButton widgetDef={widgetDef}/>
                <EditButton widgetDef={widgetDef}/>
                <IconButton size="middle" onClick={() => editableStateBinding.update(EditableState.Move)}>
                    <Icons.Move/>
                </IconButton>
            </Flex>
            </>
        } else {
            return <Flex style={style}>
                <IconButton size="middle" onClick={() => editableStateBinding.update(EditableState.Edit)}>
                    <Icons.Ok/>
                </IconButton>
            </Flex>
        }
    })
}

export interface EditableBodyProps {
    render: EditableBodyRenderer
}

const frameworkBackgroundStyle: React.CSSProperties = {
    background: "linear-gradient(45deg, #00000011 25%, #00000000 0, #00000000 50%, #00000011 0, #00000011 75%, #00000000 0)",
    backgroundSize: "10px 10px"
}

const frameworkBorderStyle: React.CSSProperties = {
    outlineWidth: 1, 
    outlineColor: "black",
}

const editableFrameworkStyles: React.CSSProperties = {
    outlineStyle: "solid",
    ...frameworkBorderStyle,
    ...frameworkBackgroundStyle,
}

const scaledFrameworkStyles: React.CSSProperties = {
    outlineStyle: "dashed",
    ...frameworkBorderStyle,
    ...frameworkBackgroundStyle,
}

export const EditableBody = (props: EditableBodyProps) => {
    const previewMode = useContext(PreviewModeContext)
    const panelId = usePanelId()
    const widgetId = useWidgetId()
    const rectReq = useWidgetRectBinding(panelId, widgetId)
    const editableStateBinding = useContext(EditableStateContext);
    const content = previewMode ? props.render.preview() : props.render[editableStateBinding.value]()
    const editableSwitch = <EditableSwitch/>
    return unwrapAsyncBinding(rectReq, rectBinding => {
        if(previewMode) {
            return <ScaledFramework rect={rectBinding.value}>
                {content}
            </ScaledFramework>
        }else if(editableStateBinding.value === EditableState.Move) {
            return <ResizableFramework
                    rect={rectBinding.value}
                    onSizeChanged={rectBinding.update}
                    attachments={editableSwitch}
                    style={editableFrameworkStyles}
                >
                {content}
            </ResizableFramework>
        } else {
            return <ScaledFramework
                rect={rectBinding.value}
                attachments={editableSwitch}
                style={scaledFrameworkStyles}
            >
                {content}
            </ScaledFramework>
        }
    })
}
