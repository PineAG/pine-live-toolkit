import { Dialog, Flex, IconButton, Icons, QuickConfirm, useLocalDBinding } from "@pltk/components"
import React, { CSSProperties, ReactNode, useContext } from "react"
import { Rect, Size } from "../../backend"
import { EditableStateContext, PanelSizeContext, PluginStoreContext, PreviewModeContext, useNotNullContext } from "../context"
import { EditableState, useEnabledPluginList, useEnabledPlugins } from "./base"
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


export const EditableSwitch = () => {
    const enabledPlugins = useEnabledPlugins()
    const plugin = useNotNullContext(PluginStoreContext)
    const editableStateBinding = useContext(EditableStateContext);
    const panelSize = useContext(PanelSizeContext)
    const {size: pluginRect} = useNotNullContext(PluginStoreContext)
    const [style, reverse] = getEditableSwitchStyle(pluginRect, panelSize)
    const tmpConfigStore = useLocalDBinding<any | null>(null)

    const pluginTemplate = enabledPlugins[plugin.meta.pluginType]

    if(editableStateBinding.value === EditableState.Edit) {
        return <>
        <Flex style={style} nowrap reverse={reverse}>
            <QuickConfirm title="删除组件" description="确认要删除组件吗？" onConfirm={() => plugin.delete()}>    
                <IconButton size="middle" icon={<Icons.Delete/>}/>
            </QuickConfirm>
            <IconButton onClick={() => tmpConfigStore.update(plugin.config)} size="middle">
                <Icons.Edit/>
            </IconButton>
            <IconButton size="middle" onClick={() => editableStateBinding.update(EditableState.Move)}>
                <Icons.Move/>
            </IconButton>
        </Flex>

        <Dialog 
            title={`设置组件 ${pluginTemplate.title}`}
            onOk={async () => {
                if(tmpConfigStore.value !== null) {
                    await plugin.setConfig(tmpConfigStore.value)
                }
                await tmpConfigStore.update(null)
            }}
            onCancel={() => tmpConfigStore.update(null)}
            open={tmpConfigStore.value !== null}>
            {tmpConfigStore.value && pluginTemplate.render.config(tmpConfigStore)}
        </Dialog>
        </>
    } else {
        return <Flex style={style}>
            <IconButton size="middle" onClick={() => editableStateBinding.update(EditableState.Edit)}>
                <Icons.Ok/>
            </IconButton>
        </Flex>
    }
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
    const store = useNotNullContext(PluginStoreContext)
    const editableStateBinding = useContext(EditableStateContext);
    const content = previewMode ? props.render.preview() : props.render[editableStateBinding.value]()
    const editableSwitch = <EditableSwitch/>
    if(previewMode) {
        return <ScaledFramework rect={store.size}>
            {content}
        </ScaledFramework>
    }else if(editableStateBinding.value === EditableState.Move) {
        return <ResizableFramework
                rect={store.size}
                onSizeChanged={store.resize}
                attachments={editableSwitch}
                style={editableFrameworkStyles}
            >
            {content}
        </ResizableFramework>
    } else {
        return <ScaledFramework
            rect={store.size}
            attachments={editableSwitch}
            style={scaledFrameworkStyles}
        >
            {content}
        </ScaledFramework>
    }
}