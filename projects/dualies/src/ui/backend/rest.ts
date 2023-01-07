import {IDisposable, ILiveToolkitClient, IPanel, IPanelMeta, IPanelReference, IWidget, IWidgetMeta, IWidgetReference, Rect, Size, SubscriptionCallback} from "@pltk/protocol"

export class RestClient implements ILiveToolkitClient {
    async getPanels(): Promise<IPanelReference[]> {
        throw new Error("Method not implemented.");
    }
    async getPanel(id: number): Promise<IPanel | null> {
        throw new Error("Method not implemented.");
    }
    async createPanel(panel: IPanel): Promise<number> {
        throw new Error("Method not implemented.");
    }
    async deletePanel(id: number): Promise<void> {
        throw new Error("Method not implemented.");
    }
    async setPanelMeta(id: number, meta: IPanelMeta): Promise<void> {
        throw new Error("Method not implemented.");
    }
    async setPanelSize(id: number, size: Size): Promise<void> {
        throw new Error("Method not implemented.");
    }
    subscribePanels(callback: SubscriptionCallback): IDisposable {
        throw new Error("Method not implemented.");
    }
    subscribePanel(id: number, callback: SubscriptionCallback): IDisposable {
        throw new Error("Method not implemented.");
    }
    async getWidgetsOfPanel(panelId: number): Promise<IWidgetReference[]> {
        throw new Error("Method not implemented.");
    }
    getWidget<Config>(id: number): Promise<IWidget<Config> | null> {
        throw new Error("Method not implemented.");
    }
    createWidget<Config>(panelId: number, widget: IWidget<Config>): Promise<number> {
        throw new Error("Method not implemented.");
    }
    async deleteWidget(widgetId: number): Promise<void> {
        throw new Error("Method not implemented.");
    }
    async setWidgetMeta(id: number, meta: IWidgetMeta): Promise<void> {
        throw new Error("Method not implemented.");
    }
    async setWidgetRect(id: number, rect: Rect): Promise<void> {
        throw new Error("Method not implemented.");
    }
    setWidgetConfig<Config>(id: number, config: Config): Promise<void> {
        throw new Error("Method not implemented.");
    }
    subscribeWidgetsOfPanel(panelId: number, callback: SubscriptionCallback): IDisposable {
        throw new Error("Method not implemented.");
    }
    subscribeWidgetRect(widgetId: number, callback: SubscriptionCallback): IDisposable {
        throw new Error("Method not implemented.");
    }
    subscribeWidgetConfig(widgetId: number, callback: SubscriptionCallback): IDisposable {
        throw new Error("Method not implemented.");
    }   
}