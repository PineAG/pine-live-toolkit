export interface APIKey {
    id: number
}

export interface PanelMeta {
    title: string
}

export interface PluginMeta {
    pluginType: string
}

export interface Size {
    width: number, height: number
}

export interface Position {
    x: number, y: number
}

export interface Rect {
    x: number, y: number
    width: number, height: number
}

export interface PanelIndex extends APIKey {
    meta: PanelMeta
}

export interface PanelBase {
    meta: PanelMeta
    size: Size
}

export interface PanelItem extends PanelBase, APIKey {}

export interface PanelWithPlugins {
    id: number
    meta: PanelMeta
    size: Size
    plugins: number[]
}

export interface PluginBase<Config> {
    meta: PluginMeta
    rect: Rect
    config: Config
}

export interface PluginItem<Config> extends PluginBase<Config>, APIKey {}
