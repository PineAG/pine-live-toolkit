import {IDisposable, ILiveToolkitClient, ILiveToolkitFileStorage, IPanel, IPanelMeta, IPanelReference, IWidget, IWidgetMeta, IWidgetReference, Rect, Size, SubscriptionCallback} from "@pltk/protocol"
import { APIWrapper, GlobalClient, PanelClient, PluginClient } from "./api";
import { BrowserStorageBackend, IndexedDBFileClient } from "./indexedDB";

export class BrowserClient implements ILiveToolkitClient {
    private api: APIWrapper
    constructor() {
        const backend = new BrowserStorageBackend()
        this.api = new APIWrapper(backend)
    }

    async getPanels(): Promise<IPanelReference[]> {
        const globalClient = new GlobalClient(this.api)
        return globalClient.panels()
    }
    async getPanel(id: number): Promise<IPanel | null> {
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
    subscribePanels(callback: SubscriptionCallback): IDisposable {
        const client = new GlobalClient(this.api)
        return client.subscribePanels(callback)
    }
    subscribePanel(id: number, callback: SubscriptionCallback): IDisposable {
        const client = new PanelClient(this.api, id)
        const meta = client.subscribeMeta(callback)
        const size = client.subscribeMeta(callback)
        return {
            close: () => {
                meta.close()
                size.close()
            }
        }
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
    async getWidget<Config>(panelId: number, widgetId: number): Promise<IWidget<Config> | null> {
        const client = new PluginClient(this.api, panelId, widgetId)
        const [meta, rect, config] = await Promise.all([
            client.meta(),
            client.size(),
            client.config()
        ])
        return {meta, rect, config}
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
    subscribeWidgetsOfPanel(panelId: number, callback: SubscriptionCallback): IDisposable {
        const client = new PanelClient(this.api, panelId)
        return client.subscribePlugins(callback)
    }
    subscribeWidgetRect(panelId: number, widgetId: number, callback: SubscriptionCallback): IDisposable {
        const client = new PluginClient(this.api, panelId, widgetId)
        return client.subscribeSize(callback)
    }
    subscribeWidgetConfig(panelId: number, widgetId: number, callback: SubscriptionCallback): IDisposable {
        const client = new PluginClient(this.api, panelId, widgetId)
        return client.subscribeConfig(callback)
    }   
}

export class BrowserFileStorage implements ILiveToolkitFileStorage {
    private client: IndexedDBFileClient
    constructor() {
        const backend = new BrowserStorageBackend()
        this.client = backend.files()
    }

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