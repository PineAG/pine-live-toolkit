import {createContext, ReactNode, useContext, useMemo} from "react"
import { DBinding } from "@pltk/components"
import { Rect, Size } from "../../backend"
import {PluginStoreContext} from "../context"

export enum EditableState {
    Edit = "edit",
    Move = "move"
}

interface Renderer<Config> {
    move: (configStore: DBinding<Config>) => ReactNode
    edit: (configStore: DBinding<Config>) => ReactNode
    preview: (configStore: DBinding<Config>) => ReactNode
    config: (configStore: DBinding<Config>) => ReactNode
}

export interface Plugin<Config> {
    title: string
    type: string
    initialize: {
        defaultSize(): Size
        defaultConfig(): Config
    }
    onDestroy?: (config: Config) => void | Promise<void>
    render: Renderer<Config>
}

export function usePluginSize(): Rect {
    const context = useContext(PluginStoreContext)
    if(context === null) {
        throw new Error("Invalid state")
    }
    return context.size
}

export interface PropsWithConfig<Config> {
    configStore: DBinding<Config>
}

const EnabledPluginContext = createContext<Plugin<any>[]>([])

export const EnabledPluginProvider = EnabledPluginContext.Provider

export function useEnabledPluginList(): Plugin<any>[] {
    return useContext(EnabledPluginContext)
}

export function useEnabledPlugins(): Record<string, Plugin<any>> {
    const list = useEnabledPluginList()
    return useMemo(() => {
        const result: Record<string, Plugin<any>> = {}
        for(const p of list){
            result[p.type] = p
        }
        return result
    }, [list])
}
