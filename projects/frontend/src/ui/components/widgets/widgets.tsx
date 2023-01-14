import { useLocalDBinding } from "@pltk/components"
import { IWidgetReference } from "@pltk/protocol"
import { usePanelId, useWidgetId, useWidgetRectBinding } from "../../backend"
import { useEnabledWidgets, WidgetContextProvider, WidgetDataProvider } from "../../configurable"

import { EditableStateContext } from "../context"
import { unwrapAsyncBinding } from "../subs"
import { EditableState } from "./base"
import { EditableBody } from "./editable"
import { PreviewFramework } from "./frameworks"

export interface ComponentProps {
    widget: IWidgetReference
}

export function EditableWidget(props: ComponentProps){
    const enabledWidgets = useEnabledWidgets()
    const meta = props.widget.meta
    const stateBinding = useLocalDBinding(EditableState.Edit)
    const panelId = usePanelId()
    const widgetId = useWidgetId()

    const widgetDef = enabledWidgets[meta.type]
    if(!widgetDef) {
        return <div>未安装组件: {meta.type}</div>
    }
    
    return <WidgetContextProvider panelId={panelId} widgetId={widgetId} widgetDefinition={widgetDef}>
        <WidgetDataProvider>
            <EditableStateContext.Provider value={stateBinding}>
                <EditableBody render={{
                    preview: () => widgetDef.render.preview(),
                    edit: () => widgetDef.render.edit(),
                    move: () => widgetDef.render.move()
                }}/>
            </EditableStateContext.Provider>
        </WidgetDataProvider>
    </WidgetContextProvider>
}

export function PreviewWidget(props: ComponentProps){
    const enabledWidgets = useEnabledWidgets()
    const meta = props.widget.meta
    const panelId = usePanelId()
    const widgetId = useWidgetId()
    const widgetRectReq = useWidgetRectBinding(panelId, widgetId)
    
    const widgetDef = enabledWidgets[meta.type]
    if(!widgetDef) {
        return <div>`未安装组件: ${meta.type}`</div>
    }
    return unwrapAsyncBinding(widgetRectReq, rectBinding => (
        <WidgetContextProvider panelId={panelId} widgetId={widgetId} widgetDefinition={widgetDef}>
            <WidgetDataProvider>
                <PreviewFramework rect={rectBinding.value}>
                    {widgetDef.render.preview()}
                </PreviewFramework>
            </WidgetDataProvider>
        </WidgetContextProvider>
    ))
}
