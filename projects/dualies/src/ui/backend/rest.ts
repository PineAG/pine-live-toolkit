import {IDisposable, ILiveToolkitClient, IPanel, IPanelMeta, IPanelReference, IWidget, IWidgetMeta, IWidgetReference, Rect, Size, SubscriptionCallback} from "@pltk/protocol"

export class RestClient implements ILiveToolkitClient {
    getPanels(): Promise<IPanelReference[]> {
        throw new Error("Method not implemented.");
    }
    getPanel(id: number): Promise<IPanel> {
        throw new Error("Method not implemented.");
    }
    createPanel(panel: IPanel): Promise<number> {
        throw new Error("Method not implemented.");
    }
    deletePanel(id: number): Promise<void> {
        throw new Error("Method not implemented.");
    }
    setPanelMeta(id: number, meta: IPanelMeta): Promise<void> {
        throw new Error("Method not implemented.");
    }
    setPanelSize(id: number, size: Size): Promise<void> {
        throw new Error("Method not implemented.");
    }
    subscribePanels(callback: SubscriptionCallback): IDisposable {
        throw new Error("Method not implemented.");
    }
    subscribePanel(id: number, callback: SubscriptionCallback): IDisposable {
        throw new Error("Method not implemented.");
    }
    getWidgetsOfPanel(panelId: number): Promise<IWidgetReference[]> {
        throw new Error("Method not implemented.");
    }
    getWidgetMeta(panelId: number, widgetId: number): Promise<IWidgetMeta> {
        throw new Error("Method not implemented.");
    }
    getWidgetRect(panelId: number, widgetId: number): Promise<Rect> {
        throw new Error("Method not implemented.");
    }
    getWidgetConfig<C>(panelId: number, widgetId: number): Promise<C> {
        throw new Error("Method not implemented.");
    }
    createWidget<Config>(panelId: number, widget: IWidget<Config>): Promise<number> {
        throw new Error("Method not implemented.");
    }
    deleteWidget(panelId: number, widgetId: number): Promise<void> {
        throw new Error("Method not implemented.");
    }
    setWidgetMeta(panelId: number, widgetId: number, meta: IWidgetMeta): Promise<void> {
        throw new Error("Method not implemented.");
    }
    setWidgetRect(panelId: number, widgetId: number, rect: Rect): Promise<void> {
        throw new Error("Method not implemented.");
    }
    setWidgetConfig<Config>(panelId: number, widgetId: number, config: Config): Promise<void> {
        throw new Error("Method not implemented.");
    }
    subscribeWidgetsOfPanel(panelId: number, callback: SubscriptionCallback): IDisposable {
        throw new Error("Method not implemented.");
    }
    subscribeWidgetRect(panelId: number, widgetId: number, callback: SubscriptionCallback): IDisposable {
        throw new Error("Method not implemented.");
    }
    subscribeWidgetConfig(panelId: number, widgetId: number, callback: SubscriptionCallback): IDisposable {
        throw new Error("Method not implemented.");
    }
    
}