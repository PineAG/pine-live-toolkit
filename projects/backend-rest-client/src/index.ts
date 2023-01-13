import {io, Socket} from "socket.io-client"
import {IDisposable, ILiveToolkitClient, ILiveToolkitFileStorage, ILiveToolkitSubscription, INewWarehouse, IPanel, IPanelMeta, IPanelReference, IWarehouse, IWarehouseMeta, IWarehouseReference, IWidget, IWidgetMeta, IWidgetReference, Rect, Size, SubscriptionActionType, SubscriptionCallback, SubscriptionEvent} from "@pltk/protocol"

export class RestClient implements ILiveToolkitClient {
    private path(parts: (string|number)[]): string {
        const cleanParts = parts.map(p => {
            if(typeof p === "number") {
                return p.toString()
            }
            const m = p.match(/^\/?(.*?)\/?$/)
            return m === null ? "" : m[1]
        }).filter(s => s.length > 0).join("/")
        return "/api/data/" + cleanParts
    }

    private async parseResponse<T>(res: Response): Promise<T> {
        if(res.status !== 200) {
            const message = await res.text()
            throw new Error(message)
        }
        return await res.json()
    }

    private async post<T>(path: (string|number)[], data: T): Promise<number> {
        const res = await fetch(this.path(path), {
            body: JSON.stringify(data),
            method: "POST",
            headers: new Headers({'content-type': 'application/json'})
        })
        return this.parseResponse(res)

    }

    private async get<T>(path: (string|number)[]): Promise<T> {
        const res = await fetch(this.path(path))
        return this.parseResponse(res)
    }

    private async put<T>(path: (string|number)[], data: T): Promise<void> {
        const res = await fetch(this.path(path), {
            body: JSON.stringify(data),
            method: "PUT",
            headers: new Headers({'content-type': 'application/json'})
        })
        return this.parseResponse(res)
    }

    private async del(path: (string|number)[]): Promise<void> {
        const res = await fetch(this.path(path), {
            method: "DELETE"
        })
        return this.parseResponse(res)
    }

    getPanels(): Promise<IPanelReference[]> {
        return this.get(["panels"])
    }
    getPanel(id: number): Promise<IPanel> {
        return this.get(["panel", id])
    }
    createPanel(panel: IPanel): Promise<number> {
        return this.post(["panels"], panel)
    }
    deletePanel(id: number): Promise<void> {
        return this.del(["panel", id])
    }
    setPanelMeta(id: number, meta: IPanelMeta): Promise<void> {
        return this.put(["panel", id, "meta"], meta)
    }
    setPanelSize(id: number, size: Size): Promise<void> {
        return this.put(["panel", id, "size"], size)
    }
    getWidgetsOfPanel(panelId: number): Promise<IWidgetReference[]> {
        return this.get(["panel", panelId, "widgets"])
    }
    getWidgetMeta(panelId: number, widgetId: number): Promise<IWidgetMeta> {
        return this.get(["panel", panelId, "widget", widgetId, "meta"])
    }
    getWidgetRect(panelId: number, widgetId: number): Promise<Rect> {
        return this.get(["panel", panelId, "widget", widgetId, "rect"])
    }
    getWidgetConfig<C>(panelId: number, widgetId: number): Promise<C> {
        return this.get(["panel", panelId, "widget", widgetId, "config"])
    }
    createWidget<Config>(panelId: number, widget: IWidget<Config>): Promise<number> {
        return this.post(["panel", panelId, "widgets"], widget)
    }
    deleteWidget(panelId: number, widgetId: number): Promise<void> {
        return this.del(["panel", panelId, "widget", widgetId])
    }
    setWidgetMeta(panelId: number, widgetId: number, meta: IWidgetMeta): Promise<void> {
        return this.put(["panel", panelId, "widget", widgetId, "meta"], meta)
    }
    setWidgetRect(panelId: number, widgetId: number, rect: Rect): Promise<void> {
        return this.put(["panel", panelId, "widget", widgetId, "rect"], rect)
    }
    setWidgetConfig<Config>(panelId: number, widgetId: number, config: Config): Promise<void> {
        return this.put(["panel", panelId, "widget", widgetId, "config"], config)
    }

    getWarehouseList<C>(type: string): Promise<IWarehouseReference[]> {
        return this.get(["warehouses", type])
    }
    getWarehouse<C>(type: string, id: number): Promise<IWarehouse<C>> {
        return this.get(["warehouse", type, id])
    }
    createWarehouse<C>(type: string, warehouse: INewWarehouse<C>): Promise<number> {
        return this.post(["warehouses", type], warehouse)
    }
    getWarehouseMeta(type: string, id: number): Promise<IWarehouseMeta> {
        return this.get(["warehouse", type, id, "meta"])
    }
    getWarehouseConfig<C>(type: string, id: number): Promise<C> {
        return this.get(["warehouse", type, id, "config"])
    }
    setWarehouseMeta(type: string, id: number, meta: IWarehouseMeta): Promise<void> {
        return this.put(["warehouse", type, id, "meta"], meta)
    }
    setWarehouseConfig<C>(type: string, id: number, config: C): Promise<void> {
        return this.put(["warehouse", type, id, "config"], config)
    }
    deleteWarehouse(type: string, id: number): Promise<void> {
        return this.del(["warehouse", type, id])
    }
}

export class RestSubscription implements ILiveToolkitSubscription {
    private socket: Socket
    constructor() {
        this.socket = io({
            path: "/api/subscription"
        })
        this.socket.on(SubscriptionActionType.Update, (evt: SubscriptionEvent) => {
            this.emitHub(evt)
        })
    }

    subscribe(evt: SubscriptionEvent, callback: SubscriptionCallback): IDisposable {
        return this.subscribeHub(evt, callback)
    }
    
    private idCounter: number = 0
    private listeners: Map<string, Map<number, SubscriptionCallback>> = new Map()

    private stringifyEvent(evt: SubscriptionEvent): string {
        const parts: string[] = [evt.type]
        if("panelId" in evt.parameters) {
            parts.push(`panelId=${evt.parameters.panelId}`)
        }
        if("widgetId" in evt.parameters) {
            parts.push(`widgetId=${evt.parameters.widgetId}`)
        }
        if("warehouseType" in evt.parameters){
            parts.push(`warehouseType=${evt.parameters.warehouseType}`)
        }
        if("warehouseId" in evt.parameters){
            parts.push(`warehouseId=${evt.parameters.warehouseId}`)
        }
        return parts.join("_")
    }

    private registerCallback(key: string, id: number, callback: SubscriptionCallback): boolean {
        let c = this.listeners.get(key)
        let subscribe = false
        if(!c) {
            c = new Map()
            this.listeners.set(key, c)
            subscribe = true
        }
        c.set(id, callback)
        return subscribe
    }

    private disposeCallback(key: string, id: number): boolean {
        const c = this.listeners.get(key)
        let dispose = false
        if(!c) return false;
        c.delete(id)
        if(c.size === 0){
            this.listeners.delete(key)
            dispose = true
        }
        return dispose
    }

    private subscribeHub(evt: SubscriptionEvent, callback: SubscriptionCallback): IDisposable {
        const id = this.idCounter++
        const eventKey = this.stringifyEvent(evt)
        const subscribe = this.registerCallback(eventKey, id, callback)
        if(subscribe) {
            this.socket.emit(SubscriptionActionType.Subscribe, evt)
        }
        return {
            close: () => {
                const dispose = this.disposeCallback(eventKey, id)
                if(dispose) {
                    this.socket.emit(SubscriptionActionType.Dispose, evt)
                }
            }
        }
    }

    private emitHub(evt: SubscriptionEvent) {
        const key = this.stringifyEvent(evt)
        const callbacks = this.listeners.get(key)?.values()
        if(!callbacks) return;
        for(const cb of callbacks) {
            setTimeout(cb, 0)
        }
    }
}

export class RestFileStorage implements ILiveToolkitFileStorage {
    async create(data: Blob): Promise<string> {
        const res = await fetch("/api/files", {
            method: "POST",
            body: data
        })
        if(res.status !== 200){
            throw new Error(await res.text())
        }
        return res.text()
    }
    async fetch(id: string): Promise<Blob> {
        const res = await fetch(`/api/files/${id}`)
        if(res.status !== 200){
            throw new Error(await res.text())
        }
        return res.blob()
    }
    async update(id: string, data: Blob): Promise<void> {
        const res = await fetch(`/api/files/${id}`, {method: "PUT"})
        if(res.status !== 200){
            throw new Error(await res.text())
        }
    }
    async delete(id: string): Promise<void> {
        const res = await fetch(`/api/files/${id}`, {method: "DELETE"})
        if(res.status !== 200){
            throw new Error(await res.text())
        }
    }
}

export interface RestfulBackendResult {
    client: ILiveToolkitClient
    subscription: ILiveToolkitSubscription
    fileStorage: ILiveToolkitFileStorage
}

export function createRestfulBackend(): RestfulBackendResult {
    return {
        client: new RestClient(),
        subscription: new RestSubscription(),
        fileStorage: new RestFileStorage()
    }
}
