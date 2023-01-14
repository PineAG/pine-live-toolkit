import { useMemo } from "react"
import { createNullableContext, useNullableContext } from "../../backend/hooks/utils"
import { WidgetDefinition } from "./base"

interface EnabledWidgetsStore {
    list: WidgetDefinition<any>[]
    mapping: Record<string, WidgetDefinition<any>>
}

const EnabledWidgetContext = createNullableContext<EnabledWidgetsStore>("Widgets provider not initialized.")

interface EnabledWidgetProviderProps {
    widgets: WidgetDefinition<any>[]
    children: any
}
export function EnabledWidgetProvider(props: EnabledWidgetProviderProps) {
    const store = useMemo<EnabledWidgetsStore>(() => {
        const mapping: Record<string, WidgetDefinition<any>> = {}
        for(const p of props.widgets){
            mapping[p.type] = p
        }
        return {list: props.widgets, mapping}
    }, [props.widgets])
    return <EnabledWidgetContext.Provider value={store}>
        {props.children}
    </EnabledWidgetContext.Provider>
}

export function useEnabledWidgetList(): WidgetDefinition<any>[] {
    return useNullableContext(EnabledWidgetContext).list
}

export function useEnabledWidgets(): Record<string, WidgetDefinition<any>> {
    return useNullableContext(EnabledWidgetContext).mapping
}
