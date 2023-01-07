import { IBackendCollectionWrapper, IBackendSubscriptionWrapper, IFileClient } from "./client"
import { APIKey, PanelBase, PanelIndex, PanelItem, PluginBase, PluginItem } from "./types"
import { error } from "./utils"

export type PanelPartition = {
    index: PanelIndex, 
    item: PanelItem
}

export type PluginPartitions = {
    id: APIKey
    item: PluginItem<any>
}

export type PanelCollectionWrapper = IBackendCollectionWrapper<APIKey, PanelBase, undefined, PanelPartition>
export type PluginCollectionWrapper = IBackendCollectionWrapper<APIKey, PluginBase<any>, {panelId: number}, PluginPartitions>

export interface IGlobalBackend {
    panels: {
        subscriber: IBackendSubscriptionWrapper<APIKey>
        collection: PanelCollectionWrapper
    }
    plugins: {
        subscriberFactory: (panelId: number) => IBackendSubscriptionWrapper<APIKey>
        collectionFactory: (panelId: number) => PluginCollectionWrapper
    }
}

export const defaultGlobalBackend: IGlobalBackend = {
    get panels(): never {
        return error("Backend not initialized")
    },
    get plugins(): never {
        return error("Backend not initialized")
    }
}

export const defaultFileClient: IFileClient = new Proxy<IFileClient>({} as any, {
    get: () => {
        throw new Error("File client not initialized")
    }
})
