import { Dialog, Icons, QuickConfirm, useLocalDStore } from "@dualies/components"
import { ButtonGroup, IconButton } from "@mui/material"
import { CSSProperties, ReactNode, useContext } from "react"
import { enabledPlugins } from "../../plugins"
import { Rect, Size } from "../../store"
import { EditableStateContext, PanelSizeContext, PluginStoreContext, useNotNullContext } from "../context"
import { EditableState } from "./base"
import { ResizableFramework, ScaledFramework } from "./frameworks"

export type EditableBodyRenderer = {
    [K in EditableState]: () => ReactNode
}

function getEditableSwitchStyle(pluginSize: Rect, panelSize: Size): CSSProperties {
    const pluginCenterX = pluginSize.x + pluginSize.width / 2
    const pluginCenterY = pluginSize.y + pluginSize.height / 2
    const panelCenterX = panelSize.width / 2
    const panelCenterY = panelSize.height / 2
    const left = pluginCenterX < panelCenterX
    const top = pluginCenterY < panelCenterY
    const style: CSSProperties = {position: "absolute"}
    style[left ? "right" : "left"] = 0
    style[top ? "bottom" : "top"] = 0
    return style
}

export const EditableSwitch = () => {
    const plugin = useNotNullContext(PluginStoreContext)
    const {state, setState} = useContext(EditableStateContext);
    const panelSize = useContext(PanelSizeContext)
    const {size: pluginRect} = useNotNullContext(PluginStoreContext)
    const style = getEditableSwitchStyle(pluginRect, panelSize)
    const tmpConfigStore = useLocalDStore<any | null>(null)

    const pluginTemplate = enabledPlugins[plugin.meta.pluginType]

    if(state === EditableState.Edit) {
        return <>
        <ButtonGroup style={style}>
            <QuickConfirm title="删除组件" description="确认要删除组件吗？" onConfirm={() => plugin.delete()}>    
                <IconButton size="small">
                    <Icons.Delete/>
                </IconButton>
            </QuickConfirm>
            <IconButton onClick={() => tmpConfigStore.update(plugin.config)} size="small">
                <Icons.Edit/>
            </IconButton>
            <IconButton size="small" onClick={() => setState(EditableState.Move)}>
                <Icons.Move/>
            </IconButton>
        </ButtonGroup>

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
        return <ButtonGroup style={style}>
            <IconButton size="small" onClick={() => setState(EditableState.Edit)}>
                <Icons.Ok/>
            </IconButton>
        </ButtonGroup>
    }
}

export interface EditableBodyProps {
    render: EditableBodyRenderer
}

export const EditableBody = (props: EditableBodyProps) => {
    const store = useNotNullContext(PluginStoreContext)
    const {state} = useContext(EditableStateContext)
    const content = props.render[state]()
    const editableSwitch = <EditableSwitch/>
    if(state === EditableState.Move) {
        return <ResizableFramework
                rect={store.size}
                onSizeChanged={store.resize}
                attachments={editableSwitch}
            >
            {content}
        </ResizableFramework>
    } else {
        return <ScaledFramework
            rect={store.size}
            attachments={editableSwitch}
        >
            {content}
        </ScaledFramework>
    }
}