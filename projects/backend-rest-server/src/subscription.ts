import { ILiveToolkitClient, INewWarehouse, IPanel, IPanelMeta, IPanelReference, IWarehouse, IWarehouseReference, IWidget, IWidgetMeta, IWidgetReference, Rect, Size, SubscriptionActionType, SubscriptionEvent } from "@pltk/protocol"
import { createServer } from "http"
import * as SocketIO from "socket.io"
import { isEvent } from "./schema"

function eventToRoomName(evt: SubscriptionEvent): string {
    const segments: string[] = []
    segments.push(evt.type)
    if("panelId" in evt.parameters) {
        segments.push(`panel_${evt.parameters.panelId}`)
    }
    if("widgetId" in evt.parameters) {
        segments.push(`widget_${evt.parameters.widgetId}`)
    }
    return segments.join("/")
}

export function emitMessage(io: SocketIO.Server, evt: SubscriptionEvent) {
    const roomName = eventToRoomName(evt)
    io.in(roomName).emit(SubscriptionActionType.Update, evt)
}

type HttpServer = ReturnType<typeof createServer>

export function initializeSubscription(httpServer: HttpServer): SocketIO.Server {
    const io = new SocketIO.Server(httpServer, {
        "path": "/api/subscription"
    })
    io.on("connection", socket => {
        console.log("CONNECT!")
        socket.on(SubscriptionActionType.Subscribe, (evt) => {
            if(isEvent(evt)) {
                const roomName = eventToRoomName(evt)
                socket.join(roomName)
            } else {
                console.error("Invalid event:", evt)
            }
        })
        socket.on(SubscriptionActionType.Dispose, (evt) => {
            if(isEvent(evt)) {
                const roomName = eventToRoomName(evt)
                socket.leave(roomName)
            } else {
                console.error("Invalid event:", evt)
            }
        })
        socket.on("disconnect", () => {
            console.log("DISCONNECTED!")
        })
    })
    return io
}

export class DataSubscriptionWrapper implements ILiveToolkitClient {
    constructor(private api: ILiveToolkitClient, private io: SocketIO.Server) {}
    
    private notify(evt: SubscriptionEvent) {
        emitMessage(this.io, evt)
    }

    async getPanels(): Promise<IPanelReference[]> {
        return await this.api.getPanels()
    }
    async getPanel(id: number): Promise<IPanel> {
        return await this.api.getPanel(id)
    }
    async createPanel(panel: IPanel): Promise<number> {
        const id = await this.api.createPanel(panel)
        this.notify({
            type: "PanelList",
            parameters: {}
        })
        return id
    }
    async deletePanel(id: number): Promise<void> {
        await this.api.deletePanel(id)
        this.notify({
            type: "PanelList",
            parameters: {}
        })
    }
    async setPanelMeta(panelId: number, meta: IPanelMeta): Promise<void> {
        await this.api.setPanelMeta(panelId, meta)
        this.notify({
            type: "Panel",
            parameters: {panelId}
        })
    }
    async setPanelSize(panelId: number, size: Size): Promise<void> {
        await this.api.setPanelSize(panelId, size)
        this.notify({
            type: "Panel",
            parameters: {panelId}
        })
    }
    async getWidgetsOfPanel(panelId: number): Promise<IWidgetReference[]> {
        return await this.api.getWidgetsOfPanel(panelId)
    }
    async getWidgetMeta(panelId: number, widgetId: number): Promise<IWidgetMeta> {
        return await this.api.getWidgetMeta(panelId, widgetId)
    }
    async getWidgetRect(panelId: number, widgetId: number): Promise<Rect> {
        return await this.api.getWidgetRect(panelId, widgetId)
    }
    async getWidgetConfig<C>(panelId: number, widgetId: number): Promise<C> {
        return await this.api.getWidgetConfig(panelId, widgetId)
    }
    async createWidget<Config>(panelId: number, widget: IWidget<Config>): Promise<number> {
        const id = await this.api.createWidget(panelId, widget)
        this.notify({
            type: "WidgetListOfPanel",
            parameters: {panelId}
        })
        return id
    }
    async deleteWidget(panelId: number, widgetId: number): Promise<void> {
        await this.api.deleteWidget(panelId, widgetId)
        this.notify({
            type: "WidgetListOfPanel",
            parameters: {panelId}
        })
    }
    async setWidgetMeta(panelId: number, widgetId: number, meta: IWidgetMeta): Promise<void> {
        await this.api.setWidgetMeta(panelId, widgetId, meta)
        this.notify({
            type: "WidgetListOfPanel",
            parameters: {panelId}
        })
    }
    async setWidgetRect(panelId: number, widgetId: number, rect: Rect): Promise<void> {
        await this.api.setWidgetRect(panelId, widgetId, rect)
        this.notify({
            type: "WidgetRect",
            parameters: {panelId, widgetId}
        })
    }
    async setWidgetConfig<Config>(panelId: number, widgetId: number, config: Config): Promise<void> {
        await this.api.setWidgetConfig(panelId, widgetId, config)
        this.notify({
            type: "WidgetConfig",
            parameters: {panelId, widgetId}
        })
    }

    async getWarehouseList<C>(type: string): Promise<IWarehouseReference<C>[]> {
        return this.api.getWarehouseList(type)
    }
    async getWarehouse<C>(type: string, id: number): Promise<IWarehouse<C>> {
        return this.api.getWarehouse(type, id)
    }
    async createWarehouse<C>(type: string, warehouse: INewWarehouse<C>): Promise<number> {
        const id = await this.api.createWarehouse(type, warehouse)
        this.notify({
            type: "WarehouseList",
            parameters: {warehouseType: type}
        })
        return id
    }
    async setWarehouseTitle(type: string, id: number, title: string): Promise<void> {
        await this.api.setWarehouseTitle(type, id, title)
        this.notify({
            type: "Warehouse",
            parameters: {warehouseId: id, warehouseType: type}
        })
    }
    async setWarehouseConfig<C>(type: string, id: number, config: C): Promise<void> {
        await this.api.setWarehouseConfig(type, id, config)
        this.notify({
            type: "Warehouse",
            parameters: {warehouseId: id, warehouseType: type}
        })
    }
    
    async deleteWarehouse(type: string, id: number): Promise<void> {
        await this.api.deleteWarehouse(type, id)
        this.notify({
            type: "WarehouseList",
            parameters: {warehouseType: type}
        })
    }
}
