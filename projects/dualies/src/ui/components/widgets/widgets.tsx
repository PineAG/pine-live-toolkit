import { useLocalDBinding } from "@pltk/components"
import { IWidgetReference } from "@pltk/protocol"
import { useWidgetConfigBinding, useWidgetRectBinding } from "../../backend"

import { EditableStateContext } from "../context"
import { unwrapAsyncBinding } from "../subs"
import { EditableState, useEnabledWidgets } from "./base"
import { EditableBody } from "./editable"
import { PreviewFramework } from "./frameworks"

export interface ComponentProps {
    widget: IWidgetReference
}

export function EditableWidget(props: ComponentProps){
    const enabledPlugins = useEnabledWidgets()
    const meta = props.widget.meta
    const stateBinding = useLocalDBinding(EditableState.Edit)
    const configBindingReq = useWidgetConfigBinding<any>()

    const plugin = enabledPlugins[meta.type]
    if(!plugin) {
        return <div>未安装组件: {meta.type}</div>
    }
    
    return unwrapAsyncBinding(configBindingReq, configBinding => (
        <EditableStateContext.Provider value={stateBinding}>
            <EditableBody render={{
                preview: () => plugin.render.preview(configBinding),
                edit: () => plugin.render.edit(configBinding),
                move: () => plugin.render.move(configBinding)
            }}/>
        </EditableStateContext.Provider>
    ))
}

export function PreviewWidget(props: ComponentProps){
    const enabledPlugins = useEnabledWidgets()
    const meta = props.widget.meta
    const widgetRectReq = useWidgetRectBinding()
    const configBindingReq = useWidgetConfigBinding()
    
    const plugin = enabledPlugins[meta.type]
    if(!plugin) {
        return <div>`未安装组件: ${meta.type}`</div>
    }
    const content = unwrapAsyncBinding(configBindingReq, plugin.render.preview)
    return unwrapAsyncBinding(widgetRectReq, rectBinding => (
        <PreviewFramework rect={rectBinding.value}>
            {content}
        </PreviewFramework>
    ))
}
