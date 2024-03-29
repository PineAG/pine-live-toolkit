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

export interface IWarehouse<Config> {
    id: number
    meta: IWarehouseMeta
    type: string
    config: Config
}

export interface IWarehouseMeta {
    title: string
}

export interface IWarehouseReference {
    id: number
    meta: IWarehouseMeta
}

export interface INewWarehouse<C>{
    meta: IWarehouseMeta
    config: C
}
