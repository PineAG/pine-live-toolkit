import { AsyncSubscriptionResult, createNullableContext, DBinding, unwrapAsyncBinding, unwrapAsyncSubs, useNullableContext } from "@pltk/components";
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

const InternalWidgetConfigContext = createNullableContext<DBinding<any>>("Widget config only available in Widget definition")

export function useWidgetConfigInternal<C>(): DBinding<C> {
    return useNullableContext(InternalWidgetConfigContext)
}

export interface WidgetConfigInternalProviderProps<C> {
    configBinding: DBinding<C>
    children: React.ReactNode
}

export function WidgetConfigInternalProvider<C>(props: WidgetConfigInternalProviderProps<C>) {
    return <InternalWidgetConfigContext.Provider value={props.configBinding}>
        {props.children}
    </InternalWidgetConfigContext.Provider>
}
