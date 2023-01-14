import { unwrapAsyncBinding, useLocalDBinding } from "@pltk/components"
import { IWidgetReference } from "@pltk/protocol"
import { usePanelId, useWidgetConfigBinding, useWidgetId, useWidgetRectBinding, WidgetConfigInternalProvider } from "@pltk/core"
import { useEnabledWidgets, WidgetContextProvider } from "@pltk/core"

import { EditableStateContext } from "../context"
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
    const configReq = useWidgetConfigBinding(panelId, widgetId)

    const widgetDef = enabledWidgets[meta.type]
    if(!widgetDef) {
        return <div>未安装组件: {meta.type}</div>
    }

    return unwrapAsyncBinding(configReq, configBinding => {
        return <WidgetContextProvider panelId={panelId} widgetId={widgetId} widgetDefinition={widgetDef}>
            <WidgetConfigInternalProvider configBinding={configBinding}>
                <EditableStateContext.Provider value={stateBinding}>
                    <EditableBody render={{
                        preview: () => widgetDef.render.preview(),
                        edit: () => widgetDef.render.edit(),
                        move: () => widgetDef.render.move()
                    }}/>
                </EditableStateContext.Provider>
            </WidgetConfigInternalProvider>
        </WidgetContextProvider>
    })
}

export function PreviewWidget(props: ComponentProps){
    const enabledWidgets = useEnabledWidgets()
    const meta = props.widget.meta
    const panelId = usePanelId()
    const widgetId = useWidgetId()
    const widgetRectReq = useWidgetRectBinding(panelId, widgetId)
    const configReq = useWidgetConfigBinding(panelId, widgetId)
    
    const widgetDef = enabledWidgets[meta.type]
    if(!widgetDef) {
        return <div>`未安装组件: ${meta.type}`</div>
    }
    return unwrapAsyncBinding(widgetRectReq, rectBinding => {
        return unwrapAsyncBinding(configReq, configBinding => {
            return <WidgetContextProvider panelId={panelId} widgetId={widgetId} widgetDefinition={widgetDef}>
                <WidgetConfigInternalProvider configBinding={configBinding}>
                    <PreviewFramework rect={rectBinding.value}>
                        {widgetDef.render.preview()}
                    </PreviewFramework>
                </WidgetConfigInternalProvider>
            </WidgetContextProvider>
        })
    })
}
