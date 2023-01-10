import { IPanelMeta, Size, Rect, IWidgetMeta, IPanelReference, IDisposable, SubscriptionCallback } from "@pltk/protocol"
import { IKVDataClient, IKVSubscriptionFactory } from "./kv"
import { error } from "./utils"

export class KVPathBuilder {
    panelsCounter(): string {
        return "/panels/counter"
    }

    panelsList(): string {
        return "/panels/enabled"
    }

    panelMeta(panelId: number): string {
        return `/panel/${panelId}/meta`
    }

    panelSize(panelId: number): string {
        return `/panel/${panelId}/size`
    }

    pluginsCounter(): string {
        return `/plugins/counter`
    }

    pluginsList(panelId: number): string {
        return `/panel/${panelId}/plugins/enabled`
    }

    pluginMeta(pluginId: number): string {
        return `/plugin/${pluginId}/meta`
    }
    
    pluginRect(panelId: number, pluginId: number): string {
        return `/panel/${panelId}/plugin/${pluginId}/rect`
    }

    pluginConfig(pluginId: number): string {
        return `/plugin/${pluginId}/config`
    }
}

export class APIWrapper {
    constructor(private clientFactory: <T>(key: string) => IKVDataClient<T>){}

    private get paths(): KVPathBuilder {
        return new KVPathBuilder()
    }

    panelsCounter(): IKVDataClient<number> {
        return this.clientFactory(this.paths.panelsCounter())
    }

    panelsList(): IKVDataClient<number[]> {
        return this.clientFactory(this.paths.panelsList())
    }

    panelMeta(panelId: number): IKVDataClient<IPanelMeta> {
        return this.clientFactory(this.paths.panelMeta(panelId))
    }

    panelSize(panelId: number): IKVDataClient<Size> {
        return this.clientFactory(this.paths.panelSize(panelId))
    }

    pluginsCounter(): IKVDataClient<number> {
        return this.clientFactory(this.paths.pluginsCounter())
    }

    pluginsList(panelId: number): IKVDataClient<number[]> {
        return this.clientFactory(this.paths.pluginsList(panelId))
    }

    pluginMeta(pluginId: number): IKVDataClient<IWidgetMeta> {
        return this.clientFactory(this.paths.pluginMeta(pluginId))
    }
    
    pluginRect(panelId: number, pluginId: number): IKVDataClient<Rect> {
        return this.clientFactory(this.paths.pluginRect(panelId, pluginId))
    }

    pluginConfig<T>(pluginId: number): IKVDataClient<T> {
        return this.clientFactory(this.paths.pluginConfig(pluginId))
    }
}

export class SubscriptionWrapper {
    constructor(private factory: IKVSubscriptionFactory) {}

    private get paths(): KVPathBuilder {
        return new KVPathBuilder()
    }

    subscribePanels(cb: SubscriptionCallback): IDisposable {
        return this.factory(this.paths.panelsList()).subscribe(cb)
    }

    subscribePanelMeta(panelId: number, cb: SubscriptionCallback): IDisposable {
        return this.factory(this.paths.panelMeta(panelId)).subscribe(cb)
    }

    subscribePanelSize(panelId: number, cb: SubscriptionCallback): IDisposable {
        return this.factory(this.paths.panelSize(panelId)).subscribe(cb)
    }

    subscribePlugins(panelId: number, cb: SubscriptionCallback): IDisposable {
        return this.factory(this.paths.pluginsList(panelId)).subscribe(cb)
    }

    subscribePluginSize(panelId: number, pluginId: number, cb: SubscriptionCallback): IDisposable {
        return this.factory(this.paths.pluginRect(panelId, pluginId)).subscribe(cb)
    }

    subscribePluginConfig(panelId: number, pluginId: number, cb: SubscriptionCallback): IDisposable {
        return this.factory(this.paths.pluginConfig(pluginId)).subscribe(cb)
    }

}

export class GlobalClient {
    constructor(private api: APIWrapper){}

    async panels(): Promise<IPanelReference[]> {
        let idList = await this.api.panelsList().get()
        if(idList === null) {
            idList = []
        }
        return Promise.all(idList.map(async id => {
            const meta = await this.api.panelMeta(id).get() ?? error(`Panel not exists: ${id}`)
            return {meta, id}
        }))
    }

    async createPanel(meta: IPanelMeta, size: Size): Promise<number> {
        const panelId = await this.api.panelsCounter().get() ?? 0
        const panelList = (await this.api.panelsList().get()) ?? []
        await Promise.all([
            this.api.panelMeta(panelId).set(meta),
            this.api.panelSize(panelId).set(size)
        ])
        panelList.push(panelId)
        await this.api.panelsList().set(panelList)
        await this.api.panelsCounter().set(panelId + 1)
        return panelId
    }
}

export class PanelClient {
    constructor(private api: APIWrapper, private panelId: number) {}

    async meta(): Promise<IPanelMeta> {
        const meta = await this.api.panelMeta(this.panelId).get()
        return meta ?? error("Panel not exists")
    }

    async setMeta(meta: IPanelMeta): Promise<void> {
        await this.api.panelMeta(this.panelId).set(meta)
    }

    async size(): Promise<Size> {
        const size = await this.api.panelSize(this.panelId).get()
        return size ?? error("Panel not exists")
    }

    async resize(newSize: Size): Promise<void> {
        return await this.api.panelSize(this.panelId).set(newSize)
    }

    async createPlugin<Config>(pluginType: string, size: Rect, config: Config): Promise<number> {
        const pluginsList = (await this.api.pluginsList(this.panelId).get()) ?? []
        const pluginId = (await this.api.pluginsCounter().get()) ?? 0
        pluginsList.push(pluginId)
        await this.api.pluginMeta(pluginId).set({ type: pluginType })
        await this.api.pluginRect(this.panelId, pluginId).set(size)
        await this.api.pluginConfig(pluginId).set(config)
        await this.api.pluginsCounter().set(pluginId+1)
        await this.api.pluginsList(this.panelId).set(pluginsList)
        return pluginId
    }

    async pluginsList(): Promise<number[]> {
        return await this.api.pluginsList(this.panelId).get() ?? []
    }

    async delete() {
        const panelList = (await this.api.panelsList().get())?.filter(id => id !== this.panelId) ?? []

        const pluginList = await this.api.pluginsList(this.panelId).get() ?? []
        await this.api.panelsList().set(panelList)
        for(const pluginId of pluginList){
            await new PluginClient(this.api, this.panelId, pluginId).delete()
        }
        await this.api.pluginsCounter().delete()
        await this.api.pluginsList(this.panelId).delete()
        await this.api.panelMeta(this.panelId).delete()
        await this.api.panelSize(this.panelId).delete()
    }
}

export class PluginClient {
    constructor(private api: APIWrapper, private panelId: number, private pluginId: number) {}

    async meta(): Promise<IWidgetMeta> {
        const meta = await this.api.pluginMeta(this.pluginId).get()
        return meta ?? error("Plugin not exists")
    }

    async config(): Promise<any> {
        const config = await this.api.pluginConfig(this.pluginId).get()
        return config ?? error("Plugin not exists")
    }

    async setMeta(meta: IWidgetMeta): Promise<void> {
        await this.api.pluginMeta(this.pluginId).set(meta)
    }

    async setConfig(config: any): Promise<any> {
        await this.api.pluginConfig(this.pluginId).set(config)
    }

    async configOrNull(): Promise<{} | null> {
        const config = await this.api.pluginConfig<any>(this.pluginId).get()
        return config ?? null
    }

    async size(): Promise<Rect> {
        const size = await this.api.pluginRect(this.panelId, this.pluginId).get()
        return size ?? error("Plugin not exists")
    }

    async resize(rect: Rect): Promise<void> {
        return this.api.pluginRect(this.panelId, this.pluginId).set(rect)
    }

    async delete() {
        const pluginList = (await this.api.pluginsList(this.panelId).get()) ?? []
        await this.api.pluginsList(this.panelId).set(pluginList.filter(id => id !== this.pluginId))
        await this.api.pluginMeta(this.pluginId).delete()
        await this.api.pluginRect(this.panelId, this.pluginId).delete()
        await this.api.pluginConfig(this.pluginId).delete()
    }
}

