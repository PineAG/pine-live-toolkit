import { DBinding } from "@dualies/components"
import { ReactNode, useContext } from "react"
import { PluginStoreContext } from "../components/context"
import { Rect, Size } from "../store"

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
