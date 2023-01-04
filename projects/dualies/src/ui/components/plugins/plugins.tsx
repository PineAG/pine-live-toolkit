import { createDBinding, createReadonlyDBinding, useLocalDBinding } from "@dualies/components"

import { usePlugin } from "../../store"
import { EditableStateContext, PluginStoreContext } from "../context"
import Loading from "../Loading"
import { EditableState, useEnabledPlugins } from "./base"
import { EditableBody } from "./editable"
import { PreviewFramework } from "./frameworks"

export interface ComponentProps {
    panelId: number
    pluginId: number
}

export const EditablePlugin = (props: ComponentProps) => {
    const enabledPlugins = useEnabledPlugins()
    const store = usePlugin(props.panelId, props.pluginId)
    const stateBinding = useLocalDBinding(EditableState.Edit)
    if(store === null){
        return <Loading/>
    }
    const plugin = enabledPlugins[store.meta.pluginType]
    if(!plugin) {
        throw new Error(`Unsupported plugin: ${store.meta.pluginType}`)
    }

    const storeBinding = createDBinding({value: store.config, update: value => store.setConfig(value)})

    return <PluginStoreContext.Provider value={store}>
            <EditableStateContext.Provider value={stateBinding}>
                <EditableBody render={{
                    preview: () => plugin.render.preview(storeBinding),
                    edit: () => plugin.render.edit(storeBinding),
                    move: () => plugin.render.move(storeBinding)
                }}/>
            </EditableStateContext.Provider>
        </PluginStoreContext.Provider>
}

export function PreviewPlugin(props: ComponentProps){
    const enabledPlugins = useEnabledPlugins()
    const store = usePlugin(props.panelId, props.pluginId)
    if(store === null){
        return <Loading/>
    }
    const configBinding = createReadonlyDBinding(store.config)
    const plugin = enabledPlugins[store.meta.pluginType]
    if(!plugin) {
        return <div>`Unsupported plugin: ${store.meta.pluginType}`</div>
    }
    return <PluginStoreContext.Provider value={store}>
        <PreviewFramework rect={store.size}>
            {plugin.render.preview(configBinding)}
        </PreviewFramework>
    </PluginStoreContext.Provider>
}
