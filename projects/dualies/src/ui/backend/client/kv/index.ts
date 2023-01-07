import { IGlobalBackend } from "../../base";
import { createKVPanelCollection, createKVPluginCollection, createPanelSubscription, createPluginSubscription, KVClientFactory } from "./api";

export type { KVClientFactory } from "./api";

export function createKVBackend(clientFactory: KVClientFactory): IGlobalBackend {
    return {
        panels: {
            collection: createKVPanelCollection(clientFactory),
            subscriber: createPanelSubscription(clientFactory)
        },
        plugins: {
            collectionFactory: panelId => createKVPluginCollection(clientFactory, panelId),
            subscriberFactory: panelId => createPluginSubscription(panelId, clientFactory)
        }
    }
}
