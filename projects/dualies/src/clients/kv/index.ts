import { SubscriptionEvent } from "@pltk/protocol";
import {IDisposable, ILiveToolkitClient, ILiveToolkitFileStorage, ILiveToolkitSubscription, IPanel, IPanelMeta, IPanelReference, IWidget, IWidgetMeta, IWidgetReference, Rect, Size, SubscriptionCallback} from "@pltk/protocol"
import { APIWrapper, GlobalClient, PanelClient, PluginClient, SubscriptionWrapper } from "./api";
import { IKVDataClientFactory, IKVFileClient, IKVSubscriptionFactory } from "./kv";

export class KVDataClient implements ILiveToolkitClient {
    private api: APIWrapper
    constructor(clientFactory: IKVDataClientFactory) {
        this.api = new APIWrapper(clientFactory)
    }

    async getPanels(): Promise<IPanelReference[]> {
        const globalClient = new GlobalClient(this.api)
        return globalClient.panels()
    }
    async getPanel(id: number): Promise<IPanel> {
        const panelClient = new PanelClient(this.api, id)
        const [meta, size] = await Promise.all([
            panelClient.meta(),
            panelClient.size()
        ])
        return {meta, size}
    }
    async createPanel(panel: IPanel): Promise<number> {
        const globalClient = new GlobalClient(this.api)
        return await globalClient.createPanel(panel.meta, panel.size)
    }
    async deletePanel(id: number): Promise<void> {
        const panelClient = new PanelClient(this.api, id)
        await panelClient.delete()
    }
    async setPanelMeta(id: number, meta: IPanelMeta): Promise<void> {
        const panelClient = new PanelClient(this.api, id)
        await panelClient.setMeta(meta)
    }
    async setPanelSize(id: number, size: Size): Promise<void> {
        const panelClient = new PanelClient(this.api, id)
        await panelClient.resize(size)
    }
    async getWidgetsOfPanel(panelId: number): Promise<IWidgetReference[]> {
        const client = new PanelClient(this.api, panelId)
        const pluginIdList = await client.pluginsList()
        return Promise.all(pluginIdList.map(async id => {
            const pluginClient = new PluginClient(this.api, panelId, id)
            const meta = await pluginClient.meta()
            return {id, meta}
        }))
    }
    async getWidgetMeta(panelId: number, widgetId: number): Promise<IWidgetMeta> {
        const client = new PluginClient(this.api, panelId, widgetId)
        return await client.meta()
    }
    async getWidgetRect(panelId: number, widgetId: number): Promise<Rect> {
        const client = new PluginClient(this.api, panelId, widgetId)
        return await client.size()
    }
    async getWidgetConfig<C>(panelId: number, widgetId: number): Promise<C> {
        const client = new PluginClient(this.api, panelId, widgetId)
        return await client.config()
    }
    async createWidget<Config>(panelId: number, widget: IWidget<Config>): Promise<number> {
        const client = new PanelClient(this.api, panelId)
        return await client.createPlugin(widget.meta.type, widget.rect, widget.config)
    }
    async deleteWidget(panelId: number, widgetId: number): Promise<void> {
        const client = new PluginClient(this.api, panelId, widgetId)
        await client.delete()
    }
    async setWidgetMeta(panelId: number, widgetId: number, meta: IWidgetMeta): Promise<void> {
        const client = new PluginClient(this.api, panelId, widgetId)
        await client.setMeta(meta)
    }
    async setWidgetRect(panelId: number, widgetId: number, rect: Rect): Promise<void> {
        const client = new PluginClient(this.api, panelId, widgetId)
        await client.resize(rect)
    }
    async setWidgetConfig<Config>(panelId: number, widgetId: number, config: Config): Promise<void> {
        const client = new PluginClient(this.api, panelId, widgetId)
        await client.setConfig(config)
    }
    
}

export class KVSubscription implements ILiveToolkitSubscription {
    private subs: SubscriptionWrapper
    constructor(subscriptionFactory: IKVSubscriptionFactory) {
        this.subs = new SubscriptionWrapper(subscriptionFactory)
    }
    private subscribePanels(callback: SubscriptionCallback): IDisposable {
        return this.subs.subscribePanels(callback)
    }
    private subscribePanel(id: number, callback: SubscriptionCallback): IDisposable {
        const meta = this.subs.subscribePanelMeta(id, callback)
        const size = this.subs.subscribePanelSize(id, callback)
        return {
            close: () => {
                meta.close()
                size.close()
            }
        }
    }
    private subscribeWidgetsOfPanel(panelId: number, callback: SubscriptionCallback): IDisposable {
        return this.subs.subscribePlugins(panelId, callback)
    }
    private subscribeWidgetRect(panelId: number, widgetId: number, callback: SubscriptionCallback): IDisposable {
        return this.subs.subscribePluginSize(panelId, widgetId, callback)
    }
    private subscribeWidgetConfig(panelId: number, widgetId: number, callback: SubscriptionCallback): IDisposable {
        return this.subs.subscribePluginConfig(panelId, widgetId, callback)
    }

    subscribe(evt: SubscriptionEvent, cb: SubscriptionCallback): IDisposable {
        if(evt.type === "PanelList") {
            return this.subscribePanels(cb)
        } else if(evt.type === "Panel") {
            return this.subscribePanel(evt.parameters.panelId, cb)
        } else if(evt.type === "WidgetListOfPanel") {
            return this.subscribeWidgetsOfPanel(evt.parameters.panelId, cb)
        } else if(evt.type === "WidgetRect") {
            return this.subscribeWidgetRect(evt.parameters.panelId, evt.parameters.widgetId, cb)
        } else if(evt.type === "WidgetConfig") {
            return this.subscribeWidgetConfig(evt.parameters.panelId, evt.parameters.widgetId, cb)
        } else {
            throw new Error("Unknown event: "+JSON.stringify(evt))
        }
    }

}

export class KVFileStorage implements ILiveToolkitFileStorage {
    constructor(private client: IKVFileClient) {}

    create(data: Blob): Promise<string> {
        return this.client.create(data)
    }
    fetch(id: string): Promise<Blob> {
        return this.client.read(id)
    }
    update(id: string, data: Blob): Promise<void> {
        return this.client.update(id, data)
    }
    delete(id: string): Promise<void> {
        return this.client.delete(id)
    }
}

export interface KVBackendOptions {
    clientFactory: IKVDataClientFactory
    subscriptionFactory: IKVSubscriptionFactory
    files: IKVFileClient
}

export interface KVBackendResult {
    client: ILiveToolkitClient
    subscription: ILiveToolkitSubscription
    fileStorage: ILiveToolkitFileStorage
}

export function createKVBackend(options: KVBackendOptions): KVBackendResult {
    return {
        client: new KVDataClient(options.clientFactory),
        subscription: new KVSubscription(options.subscriptionFactory),
        fileStorage: new KVFileStorage(options.files)
    }
}

export type { IKVDataClient, IKVFileClient, IKVSubscriptionClient } from "./kv";
