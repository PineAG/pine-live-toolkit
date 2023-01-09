import {useMemo} from "react"
import { ILiveToolkitClient, ILiveToolkitFileStorage, ILiveToolkitSubscription, IWidgetMeta, IWidgetReference } from "@pltk/protocol"
import { CacheStore } from "./cache"
import { createNullableContext, useNullableContext } from "./utils"

const ClientContext = createNullableContext<ILiveToolkitClient>("Backend not initialized")
const FileStorageContext = createNullableContext<ILiveToolkitFileStorage>("FileStorage not initialized")
const SubscriptionContext = createNullableContext<ILiveToolkitSubscription>("Subscription not initialized")
const CacheContext = createNullableContext<CacheStore>("Cache not initialized")

export interface BackendOptions {
    client: ILiveToolkitClient
    subscription: ILiveToolkitSubscription
    fileStorage: ILiveToolkitFileStorage
}

interface BackendProviderProps extends BackendOptions {
    children: any
}

export function BackendProvider(props: BackendProviderProps) {
    const cache = useMemo(() => {
        return new CacheStore(props.client, props.subscription)
    }, [props.client, props.subscription])
    return <FileStorageContext.Provider value={props.fileStorage}>
        <SubscriptionContext.Provider value={props.subscription}>
            <ClientContext.Provider value={props.client}>
                <CacheContext.Provider value={cache}>
                    {props.children}
                </CacheContext.Provider>
            </ClientContext.Provider>
        </SubscriptionContext.Provider>
    </FileStorageContext.Provider>
}

export function useLiveToolkitClient(): ILiveToolkitClient {
    return useNullableContext(ClientContext)
}

export function useLiveToolkitSubscription(): ILiveToolkitSubscription {
    return useNullableContext(SubscriptionContext)
}

export function useLiveToolkitFileStorage(): ILiveToolkitFileStorage {
    return useNullableContext(FileStorageContext)
}

export function useAPISubscriptionCache(): CacheStore {
    return useNullableContext(CacheContext)
}

const PanelIdContext = createNullableContext<number>("Panel ID not provided")
export const PanelIdProvider = PanelIdContext.Provider
export function usePanelId(): number {
    return useNullableContext(PanelIdContext)
}

const WidgetReferenceContext = createNullableContext<IWidgetReference>("Widget Meta not provided")
export const WidgetProvider = WidgetReferenceContext.Provider
export function useWidgetId(): number {
    return useNullableContext(WidgetReferenceContext).id
}
export function useWidgetMeta(): IWidgetMeta {
    return useNullableContext(WidgetReferenceContext).meta
}
