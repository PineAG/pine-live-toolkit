import { ILiveToolkitClient, ILiveToolkitFileStorage, IWidgetMeta, IWidgetReference } from "@pltk/protocol"
import { createNullableContext, useNullableContext } from "./utils"

const ClientContext = createNullableContext<ILiveToolkitClient>("Backend not initialized")
const FileStorageContext = createNullableContext<ILiveToolkitFileStorage>("FileStorage not initialized")

export interface BackendOptions {
    client: ILiveToolkitClient
    fileStorage: ILiveToolkitFileStorage
}

interface BackendProviderProps extends BackendOptions {
    children: any
}

export function BackendProvider(props: BackendProviderProps) {
    return <FileStorageContext.Provider value={props.fileStorage}>
        <ClientContext.Provider value={props.client}>
            {props.children}
        </ClientContext.Provider>
    </FileStorageContext.Provider>
}

export function useLiveToolkitClient(): ILiveToolkitClient {
    return useNullableContext(ClientContext)
}

export function useLiveToolkitFileStorage(): ILiveToolkitFileStorage {
    return useNullableContext(FileStorageContext)
}

const PanelIdContext = createNullableContext<number>("Panel ID not provided")
export const PanelIdProvider = PanelIdContext.Provider
export function usePanelId(): number {
    return useNullableContext(PanelIdContext)
}

const WidgetReferenceContext = createNullableContext<IWidgetReference>("Widget ID not provided")
export const WidgetProvider = WidgetReferenceContext.Provider
export function useWidgetId(): number {
    return useNullableContext(WidgetReferenceContext).id
}
export function useWidgetMeta(): IWidgetMeta {
    return useNullableContext(WidgetReferenceContext).meta
}
