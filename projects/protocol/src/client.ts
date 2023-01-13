import { INewWarehouse, IPanel, IPanelMeta, IPanelReference, IWarehouse, IWarehouseReference, IWidget, IWidgetMeta, IWidgetReference, Rect, Size } from "./base";
import { SubscriptionEvent } from "./events";

export type SubscriptionCallback = () => void

export interface IDisposable {
    close(): void
}

export interface ILiveToolkitClient {
    getPanels(): Promise<IPanelReference[]>
    getPanel(id: number): Promise<IPanel>
    createPanel(panel: IPanel): Promise<number>
    deletePanel(id: number): Promise<void>
    setPanelMeta(id: number, meta: IPanelMeta): Promise<void>
    setPanelSize(id: number, size: Size): Promise<void>

    
    getWidgetsOfPanel(panelId: number): Promise<IWidgetReference[]>
    getWidgetMeta(panelId: number, widgetId: number): Promise<IWidgetMeta>
    getWidgetRect(panelId: number, widgetId: number): Promise<Rect>
    getWidgetConfig<C>(panelId: number, widgetId: number): Promise<C>
    createWidget<Config>(panelId: number, widget: IWidget<Config>): Promise<number>
    deleteWidget(panelId: number, widgetId: number): Promise<void>
    setWidgetMeta(panelId: number, widgetId: number, meta: IWidgetMeta): Promise<void>
    setWidgetRect(panelId: number, widgetId: number, rect: Rect): Promise<void>
    setWidgetConfig<Config>(panelId: number, widgetId: number, config: Config): Promise<void>

    getWarehouseList<C>(type: string): Promise<IWarehouseReference<C>[]>
    getWarehouse<C>(type: string, id: number): Promise<IWarehouse<C>>
    createWarehouse<C>(type: string, warehouse: INewWarehouse<C>): Promise<number>
    setWarehouseTitle(type: string, id: number, title: string): Promise<void>
    setWarehouseConfig<C>(type: string, id: number, config: C): Promise<void>
    deleteWarehouse(type: string, id: number): Promise<void>
}

export interface ILiveToolkitSubscription {
    subscribe(evt: SubscriptionEvent, callback: SubscriptionCallback): IDisposable
}

export interface ILiveToolkitFileStorage {
    create(data: Blob): Promise<string>
    fetch(id: string): Promise<Blob>
    update(id: string, data: Blob): Promise<void>
    delete(id: string): Promise<void>
}
