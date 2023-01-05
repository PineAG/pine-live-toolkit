import { IDataClient, SubscriptionManager } from "./client"

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

export interface PanelIndex extends PanelMeta {
    id: number
}
