import SocketIO from "socket.io"
import {ILiveToolkitClient, IPanel, IPanelMeta, IPanelReference, IWidget, IWidgetMeta, IWidgetReference, Rect, Size, SubscriptionEvent} from "@pltk/protocol"
import { emitMessage } from "./subscription";

export class ServerSideDataWrapper implements ILiveToolkitClient {
    constructor(private io: SocketIO.Server) {}

    private notify(evt: SubscriptionEvent) {
        emitMessage(this.io, evt)
    }

    async getPanels(): Promise<IPanelReference[]> {
        throw new Error("Method not implemented.");
    }
    async getPanel(id: number): Promise<IPanel> {
        throw new Error("Method not implemented.");
    }
    async createPanel(panel: IPanel): Promise<number> {
        throw new Error("Method not implemented.");
        this.notify({
            type: "PanelList",
            parameters: {}
        })
    }
    async deletePanel(panelId: number): Promise<void> {
        throw new Error("Method not implemented.");
        this.notify({
            type: "PanelList",
            parameters: {}
        })
    }
    async setPanelMeta(panelId: number, meta: IPanelMeta): Promise<void> {
        throw new Error("Method not implemented.");
        this.notify({
            type: "Panel",
            parameters: {panelId}
        })
    }
    async setPanelSize(panelId: number, size: Size): Promise<void> {
        throw new Error("Method not implemented.");
        this.notify({
            type: "Panel",
            parameters: {panelId}
        })
    }
    async getWidgetsOfPanel(panelId: number): Promise<IWidgetReference[]> {
        throw new Error("Method not implemented.");
    }
    async getWidgetMeta(panelId: number, widgetId: number): Promise<IWidgetMeta> {
        throw new Error("Method not implemented.");
    }
    async getWidgetRect(panelId: number, widgetId: number): Promise<Rect> {
        throw new Error("Method not implemented.");
    }
    async getWidgetConfig<C>(panelId: number, widgetId: number): Promise<C> {
        throw new Error("Method not implemented.");
    }
    async createWidget<Config>(panelId: number, widget: IWidget<Config>): Promise<number> {
        throw new Error("Method not implemented.");
        this.notify({
            type: "WidgetListOfPanel",
            parameters: {panelId}
        })
    }
    async deleteWidget(panelId: number, widgetId: number): Promise<void> {
        throw new Error("Method not implemented.");
        this.notify({
            type: "WidgetListOfPanel",
            parameters: {panelId}
        })
    }
    async setWidgetMeta(panelId: number, widgetId: number, meta: IWidgetMeta): Promise<void> {
        throw new Error("Method not implemented.");
        this.notify({
            type: "WidgetListOfPanel",
            parameters: {panelId}
        })
    }
    async setWidgetRect(panelId: number, widgetId: number, rect: Rect): Promise<void> {
        throw new Error("Method not implemented.");
        this.notify({
            type: "WidgetRect",
            parameters: {panelId, widgetId}
        })
    }
    async setWidgetConfig<Config>(panelId: number, widgetId: number, config: Config): Promise<void> {
        throw new Error("Method not implemented.");
        this.notify({
            type: "WidgetConfig",
            parameters: {panelId, widgetId}
        })
    }

}