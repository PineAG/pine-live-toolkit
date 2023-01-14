import { IDisposable, ILiveToolkitClient, ILiveToolkitSubscription, IPanel, IPanelReference, IWarehouseMeta, IWarehouseReference, IWidgetReference, Rect, SubscriptionEvent } from "@pltk/protocol";

export class CacheStore {
    constructor(private client: ILiveToolkitClient, private subs: ILiveToolkitSubscription) {}

    private idCounter: number = 0
    private store: Map<string, Map<number, (value: any) => void>> = new Map()
    private disposers: Map<string, IDisposable> = new Map()

    private registerCallback<T>(evt: SubscriptionEvent, fetcher: () => Promise<T>, cb: (value: T) => void): IDisposable {
        const key = this.stringifyEvent(evt)
        let c = this.store.get(key)
        let subscribe = false
        if(!c) {
            c = new Map()
            this.store.set(key, c)
            subscribe = true
        }
        const id = this.idCounter++
        c.set(id, cb)
        const triggerUpdate = async () => {
            const v = await fetcher()
            this.emitToCallback(evt, v)
        }
        if(subscribe) {
            const d = this.subs.subscribe(evt, triggerUpdate)
            this.disposers.set(key, d)
        }
        triggerUpdate()
        return {
            close: () => {
                let c = this.store.get(key)
                if(!c) return;
                c.delete(id)
                if(c.size === 0){
                    this.store.delete(key)
                    const d = this.disposers.get(key)
                    d?.close()
                    this.disposers.delete(key)
                }
            }
        }
    }

    private emitToCallback(evt: SubscriptionEvent, value: any) {
        const key = this.stringifyEvent(evt)
        const c = this.store.get(key)
        if(!c) return;
        for(const cb of c.values()){
            setTimeout(() => cb(value), 0)
        }
    }

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
    
    subscribePanelList(cb: (panels: IPanelReference[]) => void): IDisposable {
        return this.registerCallback(
            {type: "PanelList", parameters: {}}, 
            () => this.client.getPanels(), 
            cb)
    }

    subscribePanel(panelId: number, cb: (panel: IPanel) => void): IDisposable {
        return this.registerCallback(
            {type: "Panel", parameters: {panelId}}, 
            () => this.client.getPanel(panelId), 
            cb)
    }

    subscribeWidgets(panelId: number, cb: (widgets: IWidgetReference[]) => void): IDisposable {
        return this.registerCallback(
            {type: "WidgetListOfPanel", parameters: {panelId}}, 
            () => this.client.getWidgetsOfPanel(panelId), 
            cb)
    }

    subscribeWidgetRect(panelId: number, widgetId: number, cb: (rect: Rect) => void): IDisposable {
        return this.registerCallback(
            {type: "WidgetRect", parameters: {panelId, widgetId}}, 
            () => this.client.getWidgetRect(panelId, widgetId), 
            cb)
    }

    subscribeWidgetConfig<C>(panelId: number, widgetId: number, cb: (config: C) => void): IDisposable {
        return this.registerCallback(
            {type: "WidgetConfig", parameters: {panelId, widgetId}}, 
            () => this.client.getWidgetConfig<C>(panelId, widgetId), 
            cb)
    }

    subscribeWarehouseList(type: string, cb: (config: IWarehouseReference[]) => void): IDisposable {
        return this.registerCallback(
            {type: "WarehouseList", parameters: {warehouseType: type}},
            () => this.client.getWarehouseList(type),
            cb
        )
    }

    subscribeWarehouseMeta(type: string, id: number, cb: (meta: IWarehouseMeta) => void): IDisposable {
        return this.registerCallback(
            {type: "WarehouseMeta", parameters: {warehouseType: type, warehouseId: id}},
            () => this.client.getWarehouseMeta(type, id),
            cb
        )
    }

    subscribeWarehouseConfig<C>(type: string, id: number, cb: (config: C) => void): IDisposable {
        return this.registerCallback(
            {type: "WarehouseConfig", parameters: {warehouseType: type, warehouseId: id}},
            () => this.client.getWarehouseConfig<C>(type, id),
            cb
        )
    }
}