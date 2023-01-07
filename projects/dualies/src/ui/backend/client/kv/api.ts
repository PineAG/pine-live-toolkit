import { APIKey, PanelBase, PanelMeta, PluginBase, PluginMeta, Rect, Size } from "../../types"
import { PanelCollectionWrapper, PanelPartition, PluginCollectionWrapper, PluginPartitions } from "../../base"
import { MultiBackendCollectionAdapter } from "../combine"
import { IKVDataClient } from "./base"
import { KVDataAdaptor, KVIdAdaptor, KVReverseIndexFilter, KVRootFilter } from "./wrap"
import { IBackendSubscriptionWrapper, SubscriptionDisposer } from "../base"

export type KVClientFactory = <T>(key: string) => IKVDataClient<T>

export class APIWrapper {
    constructor(private clientFactory: KVClientFactory){}

    panelsCounter(): IKVDataClient<number> {
        return this.clientFactory("/panels/counter")
    }

    panelsList(): IKVDataClient<number[]> {
        return this.clientFactory("/panels/enabled")
    }

    panelMeta(panelId: number): IKVDataClient<PanelMeta> {
        return this.clientFactory(`/panel/${panelId}/meta`)
    }

    panelSize(panelId: number): IKVDataClient<Size> {
        return this.clientFactory(`/panel/${panelId}/size`)
    }

    pluginsCounter(): IKVDataClient<number> {
        return this.clientFactory(`/plugins/counter`)
    }

    pluginsList(panelId: number): IKVDataClient<number[]> {
        return this.clientFactory(`/panel/${panelId}/plugins/enabled`)
    }

    pluginMeta(pluginId: number): IKVDataClient<PluginMeta> {
        return this.clientFactory(`/plugin/${pluginId}/meta`)
    }
    
    pluginRect(panelId: number, pluginId: number): IKVDataClient<Rect> {
        return this.clientFactory(`/panel/${panelId}/plugin/${pluginId}/rect`)
    }

    pluginConfig<T>(pluginId: number): IKVDataClient<T> {
        return this.clientFactory(`/plugin/${pluginId}/config`)
    }
}

export function createKVPanelCollection(clientFactory: KVClientFactory): MultiBackendCollectionAdapter<{name: "id", type: number}, PanelBase, undefined, {[K in keyof PanelPartition]: keyof PanelPartition[K]}> {
    const apiWrapper = new APIWrapper(clientFactory)
    const counter = apiWrapper.panelsCounter()
    const idList = apiWrapper.panelsList()
    const index = new KVIdAdaptor({
        counter,
        idList
    })
    const query = new KVRootFilter(idList)
    return new MultiBackendCollectionAdapter({
        index: {
            name: "id",
            collection: index
        },
        query,
        collections: {
            meta: new KVDataAdaptor(id => apiWrapper.panelMeta(id)),
            size: new KVDataAdaptor(id => apiWrapper.panelSize(id))
        },
        hooks: {
            afterDelete: async panelId => {
                const plugins = createKVPluginCollection(clientFactory, panelId)
                const pluginsList = apiWrapper.pluginsList(panelId)
                const keys = await pluginsList.get() ?? []
                for(const k of keys) {
                    await plugins.delete({id: k})
                }
                await pluginsList.delete()
            }
        },
        partitions: {
            index: ["id", "meta"],
            item: ["id", "meta", "size"]
        }
    })
}

export function createKVPluginCollection(clientFactory: KVClientFactory, panelId: number): MultiBackendCollectionAdapter<{name: "id", type: number}, PluginBase<any>, {panelId: number}, {[K in keyof PluginPartitions]: keyof PluginPartitions[K]}> {
    const apiWrapper = new APIWrapper(clientFactory)
    const counter = apiWrapper.pluginsCounter()
    const idList = apiWrapper.pluginsList(panelId)
    const index = new KVIdAdaptor({
        counter,
        idList
    })
    return new MultiBackendCollectionAdapter({
        index:{
            name: "id" as const,
            collection: index
        },
        query: new KVReverseIndexFilter(({panelId}) => apiWrapper.pluginsList(panelId)),
        collections: {
            meta: new KVDataAdaptor(id => apiWrapper.pluginMeta(id)),
            rect: new KVDataAdaptor(id => apiWrapper.pluginRect(panelId, id)),
            config: new KVDataAdaptor(id => apiWrapper.pluginConfig(id))
        },
        partitions: {
            id: ["id"],
            item: ["id", "config", "meta"]
        }
    })
}

export function createPanelSubscription(clientFactory: KVClientFactory): IBackendSubscriptionWrapper<APIKey> {
    const apiWrapper = new APIWrapper(clientFactory)
    return {
        onCountChanged: cb => apiWrapper.panelsList().subscribe(cb),
        onItemChanged: (id, listener) => {
            const meta = apiWrapper.panelMeta(id.id).subscribe(listener)
            const size = apiWrapper.panelSize(id.id).subscribe(listener)
            return {
                close: () => {
                    meta.close()
                    size.close()
                }
            }
        }
    }
}

export function createPluginSubscription(panelId: number, clientFactory: KVClientFactory): IBackendSubscriptionWrapper<APIKey> {
    const apiWrapper = new APIWrapper(clientFactory)
    return {
        onCountChanged: cb => apiWrapper.pluginsList(panelId).subscribe(cb),
        onItemChanged: (id, listener) => {
            const meta = apiWrapper.pluginMeta(id.id).subscribe(listener)
            const rect = apiWrapper.pluginRect(panelId, id.id).subscribe(listener)
            const config = apiWrapper.pluginConfig<any>(id.id).subscribe(listener)
            return {
                close: () => {
                    meta.close()
                    rect.close()
                    config.close()
                }
            }
        }
    }
}
