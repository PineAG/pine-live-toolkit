import DualiesClient, { SubscriptionManager } from "@dualies/client";
import { useState, useEffect, createContext, useContext } from "react";
import { enabledPlugins } from "../plugins";
import { APIWrapper, error, GlobalClient, PanelClient, PanelIndex, PanelMeta, PluginClient, PluginMeta, Rect, Size, IBackend, IFileClient } from "./client";

const BackendContext = createContext<IBackend>(new DualiesClient({path: "/api"}))

export const BackendProvider = BackendContext.Provider

function useBackend(): IBackend {
    return useContext(BackendContext)
}

function useAPIWrapper(): APIWrapper {
    const backend = useBackend()
    return new APIWrapper(backend)
}

export function useFileClient(): IFileClient {
    return useContext(BackendContext).files()
}


function useAsyncSubscription(starter: () => Promise<SubscriptionManager>, deps: any[]) {
    const [subscription, setSubscription] = useState<null | SubscriptionManager>(null)
    useEffect(() => {
        starter().then(m => setSubscription(m))
        return () => {
            if(subscription !== null) {
                subscription.close()
            }
        }
    }, deps)
}

interface UseStateSubscriptionProps<T> {
    subscribe: (cb: () => void) => Promise<SubscriptionManager>
    fetchValue: () => Promise<T>
    setValue: (v: T | null) => void
    deps: any[]
}

function useStateSubscription<T>(props: UseStateSubscriptionProps<T>) {
    const updateValue = async () => {
        props.setValue(null)
        const value = await props.fetchValue()
        props.setValue(value)
    }
    useAsyncSubscription(() => props.subscribe(updateValue), props.deps)
    useEffect(() => {
        props.fetchValue().then(props.setValue)
    }, props.deps)
}

export interface GlobalInfo {
    panels: PanelIndex[]
    createPanel(title: string, size: Size): Promise<void>
}

export function useGlobal(): null | GlobalInfo {
    const api = useAPIWrapper()
    const client = new GlobalClient(api)
    const [panels, setPanels] = useState<null | PanelIndex[]>(null)
    useStateSubscription({
        fetchValue: () => client.panels(),
        setValue: setPanels,
        subscribe: cb => client.subscribePanels(cb),
        deps: []
    })
    if(panels===null){
        return null
    }
    return {
        panels,
        createPanel: async (title, size) => {
            await client.createPanel({title}, size) 
        }
    }
}

interface PanelInfoActions {
    setTitle(title: string): Promise<void>
    resize(size: Size): Promise<void>
    createPlugin(pluginType: string, size: Rect, config: any): Promise<void>
    delete(): Promise<void>
}

export interface PanelInfo extends PanelInfoActions {
    meta: PanelMeta
    size: Size
    pluginsList: number[]
}



export function usePanel(panelId: number): null | PanelInfo {
    const api = useAPIWrapper()
    const client = new PanelClient(api, panelId)
    const [meta, setMeta] = useState<PanelMeta | null>(null)
    const [size, setSize] = useState<Size | null>(null)
    const [pluginsList, setPluginsList] = useState<number[] | null>(null)
    useStateSubscription({
        fetchValue: () => client.meta(),
        setValue: setMeta,
        subscribe: cb => client.subscribeMeta(cb),
        deps: [panelId]
    })
    useStateSubscription({
        fetchValue: () => client.size(),
        setValue: setSize,
        subscribe: cb => client.subscribeSize(cb),
        deps: [panelId]
    })
    useStateSubscription({
        fetchValue: () => client.pluginsList(),
        setValue: setPluginsList,
        subscribe: cb => client.subscribePlugins(cb),
        deps: [panelId]
    })
    if (meta === null || size === null || pluginsList === null) {
        return null
    }
    return {
        meta, size, pluginsList,
        resize: async (size) => {
            setSize(null)
            await client.resize(size)
            setSize(size)
        }, 
        createPlugin: async (pluginType) => {
            setPluginsList(null)
            const size = enabledPlugins[pluginType]?.initialize.defaultSize() ?? error(`Invalid plugin type: ${pluginType}`)
            const config = enabledPlugins[pluginType]?.initialize.defaultConfig() ?? error(`Invalid plugin type: ${pluginType}`)
            const plugins = await client.createPlugin(pluginType, {x: 0, y: 0, ...size}, config)
            setPluginsList(plugins)
        },
        delete: () => client.delete(),
        setTitle: async (title) => {
            const meta = await client.setTitle(title)
            setMeta(meta)
        }
    }
}

export interface PluginInfo {
    meta: PluginMeta
    size: Rect
    config: any
    resize(size: Rect): Promise<void>
    delete(): Promise<void>
    setConfig: (config: any) => Promise<void>
}

export function usePlugin(panelId: number, pluginId: number): PluginInfo | null {
    const api = useAPIWrapper()
    const client = new PluginClient(api, panelId, pluginId)
    const [meta, setMeta] = useState<null | PluginMeta>(null)
    const [size, setSize] = useState<null | Rect>(null)
    const [config, setConfig] = useState<null | any>(null)

    useStateSubscription({
        fetchValue: () => client.meta(),
        setValue: setMeta,
        subscribe: cb => client.subscribeMeta(cb),
        deps: [panelId, pluginId]
    })
    useStateSubscription({
        fetchValue: () => client.size(),
        setValue: setSize,
        subscribe: cb => client.subscribeSize(cb),
        deps: [panelId, pluginId]
    })
    useStateSubscription({
        fetchValue: async () => {
            const config = await client.configOrNull()
            if(config === null) {
                const meta = await client.meta()
                return enabledPlugins[meta.pluginType].initialize.defaultConfig()
            }
            return config
        },
        setValue: setConfig,
        subscribe: cb => client.subscribeConfig(cb),
        deps: [panelId, pluginId]
    })

    if(meta === null || size === null || config === null){
        return null
    }
    const pluginTemplate = enabledPlugins[meta.pluginType]
    return {
        meta, size, 
        config: config ?? pluginTemplate.initialize.defaultConfig(),
        resize: (size) => client.resize(size),
        setConfig: (c) => client.setConfig(c),
        delete: async () => {
            await client.delete()
            if(pluginTemplate.onDestroy) {
                await pluginTemplate.onDestroy(config)
            } 
        }
    }
}

export function useFileId(fileId: string | null): string | null {
    const [url, setUrl] = useState<string | null>(null)
    const fileClient = useFileClient()
    useEffect(() => {
        if(fileId) {
            const p = fileClient.readAsObjectURL(fileId)
            p.then(url => {
                if(url) {
                    setUrl(url)
                }
            })
            return () => p.then(url => {
                if(url) {
                    URL.revokeObjectURL(url)
                }
            })
        } else {
            setUrl(null)
        }
        return () => {}
    }, [fileId])
    return url
}

// export function useFileId(fileId: string | null): string | null {
//     const [url, setURL] = useState<string | null>(null)
//     useEffect(() => {
//         if(fileId === null) {
//             return
//         }
//         const client = new FileClient()
//         const promise = client.downloadAsObjectURL(fileId)
//         promise.then(setURL)
//         return () => {
//             promise.then(url => URL.revokeObjectURL(url))
//         }
//     }, [fileId])
//     if(fileId === null) {
//         return null;
//     }
//     return url
// }
