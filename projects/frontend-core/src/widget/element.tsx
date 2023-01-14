import { AsyncSubscriptionResult, createNullableContext, DBinding, unwrapAsyncBinding, unwrapAsyncSubs, useAsyncTemporaryBinding, useNullableContext } from "@pltk/components";
import { IWidgetMeta } from "@pltk/protocol";
import React from "react";
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

interface WidgetCachedDataProviderProps<C> {
    binding: DBinding<C>
    children: React.ReactNode
}

function WidgetCachedDataProvider<C>(props: WidgetCachedDataProviderProps<C>) {
    const meta = useWidgetMeta()
    return <InternalWidgetMetaContext.Provider value={meta}>
            <InternalWidgetConfigContext.Provider value={props.binding}>
                {props.children}
            </InternalWidgetConfigContext.Provider>
        </InternalWidgetMetaContext.Provider>
}

export function useCachedDataProvider<C>(): AsyncSubscriptionResult<[React.FC<WidgetDataProviderProps>, () => Promise<void>, boolean]> {
    const {panelId, widgetId} = useNullableContext(WidgetIdContext)
    const configReq = useWidgetConfigBinding<C>(panelId, widgetId)
    const tmpConfigReq = useAsyncTemporaryBinding<C>(configReq)
    if(tmpConfigReq.status !== "success") {
        return tmpConfigReq
    } else {
        const [configBinding, saver, isDirty] = tmpConfigReq.value
        const Provider = (props: WidgetDataProviderProps) => <WidgetCachedDataProvider<C> binding={configBinding}>
            {props.children}
        </WidgetCachedDataProvider>
        return {
            status: "success",
            value: [Provider, saver, isDirty]
        }
    }
}
