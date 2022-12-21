
import DualiesClient, { JsonDataClient, SubscriptionManager } from "@dualies/client";

export interface PanelMeta {
    title: string
}

export interface PluginMeta {
    pluginType: string
}

export interface Size {
    width: number, height: number
}

export interface Position {
    x: number, y: number
}

export interface Rect {
    x: number, y: number
    width: number, height: number
}

class APIWrapper {
    private client = new DualiesClient({
        path: "/api"
    })

    panelsCounter(): JsonDataClient<number> {
        return this.client.data("/panels/counter")
    }

    panelsList(): JsonDataClient<number[]> {
        return this.client.data("/panels/enabled")
    }

    panelMeta(panelId: number): JsonDataClient<PanelMeta> {
        return this.client.data(`/panel/${panelId}/meta`)
    }

    panelSize(panelId: number): JsonDataClient<Size> {
        return this.client.data(`/panel/${panelId}/size`)
    }

    pluginsCounter(panelId: number): JsonDataClient<number> {
        return this.client.data(`/panel/${panelId}/plugins/counter`)
    }

    pluginsList(panelId: number): JsonDataClient<number[]> {
        return this.client.data(`/panel/${panelId}/plugins/enabled`)
    }

    pluginMeta(panelId: number, pluginId: number): JsonDataClient<PluginMeta> {
        return this.client.data(`/panel/${panelId}/plugin/${pluginId}/meta`)
    }
    
    pluginRect(panelId: number, pluginId: number): JsonDataClient<Rect> {
        return this.client.data(`/panel/${panelId}/plugin/${pluginId}/rect`)
    }

    pluginConfig<T>(panelId: number, pluginId: number): JsonDataClient<T> {
        return this.client.data(`/panel/${panelId}/plugin/${pluginId}/config`)
    }
}

type Callback = () => void

export function error(message: string): never {
    throw new Error(message)
}

export interface PanelIndex extends PanelMeta {
    id: number
}

export class GlobalClient {
    private api = new APIWrapper()

    async panels(): Promise<PanelIndex[]> {
        let idList = await this.api.panelsList().get()
        if(idList === null) {
            idList = []
        }
        return Promise.all(idList.map(async id => {
            const meta = await this.api.panelMeta(id).get() ?? error(`Panel not exists: ${id}`)
            return {...meta, id}
        }))
    }

    async subscribePanels(callback: Callback): Promise<SubscriptionManager> {
        return this.api.panelsList().subscribe(callback)
    }

    async createPanel(meta: PanelMeta, size: Size): Promise<number> {
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
    private api = new APIWrapper()

    constructor(private panelId: number) {}

    async meta(): Promise<PanelMeta> {
        const meta = await this.api.panelMeta(this.panelId).get()
        return meta ?? error("Panel not exists")
    }

    async setTitle(title: string): Promise<PanelMeta> {
        const meta = await this.meta()
        const newMeta: PanelMeta = {...meta, title}
        await this.api.panelMeta(this.panelId).set(newMeta)
        return newMeta
    }

    async size(): Promise<Size> {
        const size = await this.api.panelSize(this.panelId).get()
        return size ?? error("Panel not exists")
    }

    async resize(newSize: Size): Promise<void> {
        return await this.api.panelSize(this.panelId).set(newSize)
    }

    async createPlugin<Config>(pluginType: string, size: Rect, config: Config): Promise<number[]> {
        const pluginsList = (await this.api.pluginsList(this.panelId).get()) ?? []
        const pluginId = (await this.api.pluginsCounter(this.panelId).get()) ?? 0
        pluginsList.push(pluginId)
        await this.api.pluginMeta(this.panelId, pluginId).set({ pluginType })
        await this.api.pluginRect(this.panelId, pluginId).set(size)
        await this.api.pluginConfig(this.panelId, pluginId).set(config)
        await this.api.pluginsCounter(this.panelId).set(pluginId+1)
        await this.api.pluginsList(this.panelId).set(pluginsList)
        return pluginsList
    }

    async pluginsList(): Promise<number[]> {
        return await this.api.pluginsList(this.panelId).get() ?? []
    }

    async delete() {
        const panelList = (await this.api.panelsList().get())?.filter(id => id !== this.panelId) ?? []

        const pluginList = await this.api.pluginsList(this.panelId).get() ?? []
        await this.api.panelsList().set(panelList)
        for(const pluginId of pluginList){
            await new PluginClient(this.panelId, pluginId).delete()
        }
        await this.api.pluginsCounter(this.panelId).delete()
        await this.api.pluginsList(this.panelId).delete()
        await this.api.panelMeta(this.panelId).delete()
        await this.api.panelSize(this.panelId).delete()
    }

    async subscribeMeta(callback: Callback): Promise<SubscriptionManager> {
        return this.api.panelMeta(this.panelId).subscribe(callback)
    }

    async subscribePlugins(callback: Callback): Promise<SubscriptionManager> {
        return this.api.pluginsList(this.panelId).subscribe(callback)
    }

    async subscribeSize(callback: Callback): Promise<SubscriptionManager> {
        return this.api.panelSize(this.panelId).subscribe(callback)
    }
    
}

export class PluginClient {
    private api = new APIWrapper()

    constructor(private panelId: number, private pluginId: number) {}

    async meta(): Promise<PluginMeta> {
        const meta = await this.api.pluginMeta(this.panelId, this.pluginId).get()
        return meta ?? error("Plugin not exists")
    }

    async config(): Promise<any> {
        const config = await this.api.pluginConfig(this.panelId, this.pluginId).get()
        return config ?? error("Plugin not exists")
    }

    async setConfig(config: any): Promise<any> {
        await this.api.pluginConfig(this.panelId, this.pluginId).set(config)
    }

    async configOrNull(): Promise<{} | null> {
        const config = await this.api.pluginConfig<any>(this.panelId, this.pluginId).get()
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
        await this.api.pluginMeta(this.panelId, this.pluginId).delete()
        await this.api.pluginRect(this.panelId, this.pluginId).delete()
        await this.api.pluginConfig(this.panelId, this.pluginId).delete()
    }

    async subscribeMeta(callback: Callback): Promise<SubscriptionManager> {
        return this.api.pluginMeta(this.panelId, this.pluginId).subscribe(callback)
    }

    async subscribeSize(callback: Callback): Promise<SubscriptionManager> {
        return this.api.pluginRect(this.panelId, this.pluginId).subscribe(callback)
    }

    async subscribeConfig<T>(callback: Callback): Promise<SubscriptionManager> {
        return this.api.pluginConfig<T>(this.panelId, this.pluginId).subscribe(callback)
    }
}

export class FileClient {
    private client = new DualiesClient({
        path: "/api"
    })

    async upload(data: Blob | Uint8Array | string): Promise<string> {
        if(data instanceof Uint8Array) {
            data = new Blob([data])
        }
        const fileId = await this.client.files().create(data)
        return fileId
    }

    async downloadAsObjectURL(fileId: string): Promise<string> {
        return await this.client.files().readAsObjectURL(fileId)
    }
}
