import { IPanel, IPanelMeta, IPanelReference, IWidget, IWidgetMeta, IWidgetReference, Rect, Size } from "./base";

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
}

export interface ILiveToolkitSubscription {
    subscribePanels(callback: SubscriptionCallback): IDisposable
    subscribePanel(id: number, callback: SubscriptionCallback): IDisposable
    subscribeWidgetsOfPanel(panelId: number, callback: SubscriptionCallback): IDisposable
    subscribeWidgetRect(panelId: number, widgetId: number, callback: SubscriptionCallback): IDisposable
    subscribeWidgetConfig(panelId: number, widgetId: number, callback: SubscriptionCallback): IDisposable
}

export interface ILiveToolkitFileStorage {
    create(data: Blob): Promise<string>
    fetch(id: string): Promise<Blob>
    update(id: string, data: Blob): Promise<void>
    delete(id: string): Promise<void>
}
