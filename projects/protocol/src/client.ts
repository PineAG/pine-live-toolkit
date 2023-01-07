import { IPanel, IPanelMeta, IPanelReference, IWidget, IWidgetMeta, IWidgetReference, Rect, Size } from "./base";

export type SubscriptionCallback = () => void

export interface IDisposable {
    close(): void
}

export interface ILiveToolkitClient {
    getPanels(): Promise<IPanelReference[]>
    getPanel(id: number): Promise<IPanel | null>
    createPanel(panel: IPanel): Promise<number>
    deletePanel(id: number): Promise<void>
    setPanelMeta(id: number, meta: IPanelMeta): Promise<void>
    setPanelSize(id: number, size: Size): Promise<void>

    subscribePanels(callback: SubscriptionCallback): IDisposable
    subscribePanel(id: number, callback: SubscriptionCallback): IDisposable
    
    getWidgetsOfPanel(panelId: number): Promise<IWidgetReference[]>
    getWidget<Config>(panelId: number, widgetId: number): Promise<IWidget<Config> | null>
    createWidget<Config>(panelId: number, widget: IWidget<Config>): Promise<number>
    deleteWidget(panelId: number, widgetId: number): Promise<void>
    setWidgetMeta(panelId: number, widgetId: number, meta: IWidgetMeta): Promise<void>
    setWidgetRect(panelId: number, widgetId: number, rect: Rect): Promise<void>
    setWidgetConfig<Config>(panelId: number, widgetId: number, config: Config): Promise<void>

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
