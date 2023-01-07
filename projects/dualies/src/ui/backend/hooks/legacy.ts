import { useEffect, useState } from "react";
import { useEnabledPlugins } from "../../components/plugins";
import { PanelIndex, PanelItem, PanelMeta, PluginBase, PluginMeta, Rect, Size } from "../types";
import { error } from "../utils";
import { useBackend } from "./base";

export interface GlobalInfo {
    panels: PanelIndex[]
    createPanel(title: string, size: Size): Promise<void>
}

export function useGlobal(): null | GlobalInfo {
    const backend = useBackend()
    const [panels, setPanels] = useState<null | PanelIndex[]>(null)
    async function updatePanels() {
        const panels = await backend.panels.collection.queryPartition(undefined, "index")
        setPanels(panels)
    }
    useEffect(() => {
        updatePanels()
        const disposer = backend.panels.subscriber.onCountChanged(updatePanels)
        return () => disposer.close()
    }, [])
    if(panels === null) {
        return null
    }
    return {
        panels,
        createPanel: async (title, size) => {
            await backend.panels.collection.create({
                meta: {title},
                size
            })
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
    const enabledPlugins = useEnabledPlugins()
    const backend = useBackend()

    const [panel, setPanel] = useState<null | PanelItem>(null)
    const [pluginsList, setPluginsList] = useState<null | number[]>(null)

    async function updatePanel(){
        const panel = await backend.panels.collection.get({id: panelId})
        setPanel(panel)
    }
    useEffect(() => {
        updatePanel()
        const disposer = backend.panels.subscriber.onItemChanged({id: panelId}, updatePanel)
        return () => disposer.close()
    }, [panelId])

    async function updatePluginsList() {
        const list = await backend.plugins.collectionFactory(panelId).queryPartition({panelId}, "id")
        setPluginsList(list.map(it => it.id))
    }
    useEffect(() => {
        updatePluginsList()
        const disposer = backend.plugins.subscriberFactory(panelId).onCountChanged(updatePluginsList)
        return () => disposer.close()
    }, [panelId])

    if(panel === null || pluginsList === null) {
        return null
    }
    
    return {
        meta: panel.meta,
        size: panel.size, 
        pluginsList,
        resize: async (size) => {
            await backend.panels.collection.update({id: panelId}, {size})
        }, 
        createPlugin: async (pluginType) => {
            const size = enabledPlugins[pluginType]?.initialize.defaultSize() ?? error(`Invalid plugin type: ${pluginType}`)
            const config = enabledPlugins[pluginType]?.initialize.defaultConfig() ?? error(`Invalid plugin type: ${pluginType}`)
            await backend.plugins.collectionFactory(panelId).create({
                meta: {pluginType},
                rect: {x: 0, y: 0, ...size},
                config
            })
        },
        delete: async () => {
            await backend.panels.collection.delete({id: panelId})
        },
        setTitle: async (title) => {
            await backend.panels.collection.update({id: panelId}, {
                meta: {title}
            })
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
    const enabledPlugins = useEnabledPlugins()
    const backend = useBackend()
    
    const collection = backend.plugins.collectionFactory(panelId)

    const [plugin, setPlugin] = useState<null | PluginBase<any>>(null)
    async function updatePlugin() {
        const plugin = await collection.get({id: pluginId})
        setPlugin(plugin)
    }
    useEffect(() => {
        updatePlugin()
        const disposer = backend.plugins.subscriberFactory(panelId).onItemChanged({id: pluginId}, updatePlugin)
        return () => disposer.close()
    }, [panelId, pluginId])

    if(plugin === null) {
        return null
    }

    const pluginTemplate = enabledPlugins[plugin.meta.pluginType]

    return {
        meta: plugin.meta, 
        size: plugin.rect, 
        config: plugin.config ?? pluginTemplate.initialize.defaultConfig(),
        resize: async (rect) => {
            await collection.update({id: pluginId}, {rect})
        },
        setConfig: async (config) => {
            await collection.update({id: pluginId}, {config})
        },
        delete: async () => {
            await collection.delete({id: pluginId}) 
        }
    }
}
