import {createContext, ReactNode, useContext, useMemo} from "react"
import { DBinding } from "@pltk/components"
import { Size } from "@pltk/protocol"
export enum EditableState {
    Edit = "edit",
    Move = "move"
}

interface Renderer<Config> {
    move: (configBinding: DBinding<Config>) => ReactNode
    edit: (configBinding: DBinding<Config>) => ReactNode
    preview: (configBinding: DBinding<Config>) => ReactNode
    config: (configBinding: DBinding<Config>) => ReactNode
}

export interface WidgetDefinition<Config> {
    title: string
    type: string
    initialize: {
        defaultSize(): Size
        defaultConfig(): Config
    }
    onDestroy?: (config: Config) => void | Promise<void>
    render: Renderer<Config>
}

export interface PropsWithConfig<Config> {
    configBinding: DBinding<Config>
}

interface EnabledWidgetsStore {
    list: WidgetDefinition<any>[]
    mapping: Record<string, WidgetDefinition<any>>
}

const EnabledWidgetContext = createContext<EnabledWidgetsStore>({list: [], mapping: {}})

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
    return useContext(EnabledWidgetContext).list
}

export function useEnabledWidgets(): Record<string, WidgetDefinition<any>> {
    return useContext(EnabledWidgetContext).mapping
}
