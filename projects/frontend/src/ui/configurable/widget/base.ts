import { Size } from "@pltk/protocol"

interface Renderer {
    move: () => React.ReactNode
    edit: () => React.ReactNode
    preview: () => React.ReactNode
    config: () => React.ReactNode
}

export interface WidgetDefinition<Config> {
    title: string
    type: string
    initialize: {
        defaultSize(): Size
        defaultConfig(): Config
    }
    onDestroy?: (config: Config) => void | Promise<void>
    render: Renderer
}
