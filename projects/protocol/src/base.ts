export interface Size {
    width: number
    height: number
}

export interface Rect {
    x: number, y: number
    width: number, height: number
}

export interface IPanelMeta {
    title: string
}

export interface IPanel {
    meta: IPanelMeta
    size: Size
}

export interface IPanelReference {
    id: number
    meta: IPanelMeta
}

export interface IWidgetMeta {
    type: string
}

export interface IWidget<Config> {
    meta: IWidgetMeta
    rect: Rect
    config: Config
}

export interface IWidgetReference {
    id: number
    meta: IWidgetMeta
}
