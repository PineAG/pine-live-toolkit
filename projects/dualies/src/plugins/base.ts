import { ReactNode } from "react"
import { EditableState } from "../components/plugins/base"
import { Rect, Size } from "../store"

interface Renderer<Config> {
    move: (config: Config) => ReactNode
    preview: (config: Config) => ReactNode
    config: (config: Config, setConfig: (c: Config) => void) => ReactNode
}

export interface Plugin<Config> {
    type: string
    initialize: {
        defaultSize(): Size
        defaultConfig(): Config
    }
    render: Renderer<Config>
}
