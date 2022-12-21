import { ReactNode, useContext } from "react"
import { PluginStoreContext } from "../components/context"
import { EditableState } from "../components/plugins/base"
import { Rect, Size } from "../store"

interface Renderer<Config> {
    move: (config: Config) => ReactNode
    edit: (config: Config, setConfig: (c: Config) => void) => ReactNode
    preview: (config: Config) => ReactNode
    config: (config: Config, setConfig: (c: Config) => void) => ReactNode
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
    config: Config
}

export interface PropsWithSetConfig<Config> {
    config: Config
    setConfig: (c: Config) => void
}
