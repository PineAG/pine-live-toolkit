import { IPanel, IPanelMeta, IWidget, IWidgetMeta, Rect, Size, SubscriptionEvent, INewWarehouse } from "@pltk/protocol"

export type IDType = number
export type PanelType = IPanel
export type WidgetMetaType = IWidgetMeta
export type WidgetType = IWidget<any>
export type RectType = Rect
export type SizeType = Size
export type PanelMetaType = IPanelMeta
export type NewWarehouseType = INewWarehouse<any>
export type TitleType = string

export type EventType = SubscriptionEvent
