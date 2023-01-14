import { createNullableContext, DBinding, unwrapAsyncBinding, useNullableContext } from "@pltk/components";
import { IWidgetMeta } from "@pltk/protocol";
import { useWidgetConfigBinding, useWidgetMeta } from "../backend";
import { WidgetDefinition } from "./base";

const WidgetIdContext = createNullableContext<{panelId: number, widgetId: number}>("Widget ID not initialized")
const WidgetDefinitionContext = createNullableContext<WidgetDefinition<any>>("Widget definition not initialized")

export interface WidgetContextProviderProps {
    widgetId: number
    panelId: number
    widgetDefinition: WidgetDefinition<any>
    children: React.ReactNode
}

export function WidgetContextProvider(props: WidgetContextProviderProps) {
    return <WidgetDefinitionContext.Provider value={props.widgetDefinition}>
        <WidgetIdContext.Provider value={{panelId: props.panelId, widgetId: props.widgetId}}>
            {props.children}
        </WidgetIdContext.Provider>
    </WidgetDefinitionContext.Provider>
}

const InternalWidgetMetaContext = createNullableContext<IWidgetMeta>("Widget meta only available in Widget definition")
const InternalWidgetConfigContext = createNullableContext<DBinding<any>>("Widget config only available in Widget definition")

export function useWidgetMetaInternal(): IWidgetMeta {
    return useNullableContext(InternalWidgetMetaContext)
}

export function useWidgetConfigInternal<C>(): DBinding<C> {
    return useNullableContext(InternalWidgetConfigContext)
}

export interface WidgetDataProviderProps {
    children: React.ReactNode
}

export function WidgetDataProvider(props: WidgetDataProviderProps) {
    const {panelId, widgetId} = useNullableContext(WidgetIdContext)
    const meta = useWidgetMeta()
    const configReq = useWidgetConfigBinding(panelId, widgetId)
    return unwrapAsyncBinding(configReq, configBinding => {
        return <InternalWidgetMetaContext.Provider value={meta}>
            <InternalWidgetConfigContext.Provider value={configBinding}>
                {props.children}
            </InternalWidgetConfigContext.Provider>
        </InternalWidgetMetaContext.Provider>
    })
}
