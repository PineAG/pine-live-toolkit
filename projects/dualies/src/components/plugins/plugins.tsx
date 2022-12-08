import {useContext, createContext} from "react"
import { enabledPlugins } from "../../plugins"
import { Rect, usePlugin } from "../../store"
import { PanelSizeContext, PluginStoreContext, EditableStateContext, useStateManager } from "../context"
import Loading from "../Loading"
import { EditableState } from "./base"
import { EditableBody, EditableBodyRenderer } from "./editable"
import { ResizableFramework } from "./frameworks"

export interface ComponentProps {
    panelId: number
    pluginId: number
}

export const EditablePlugin = (props: ComponentProps) => {
    const store = usePlugin(props.panelId, props.pluginId)
    const editableState = useStateManager(EditableState.Preview)
    if(store === null){
        return <Loading/>
    }
    const plugin = enabledPlugins[store.meta.pluginType]
    if(!plugin) {
        throw new Error(`Unsupported plugin: ${store.meta.pluginType}`)
    }

    return <PluginStoreContext.Provider value={store}>
            <EditableStateContext.Provider value={editableState}>
                <EditableBody render={{
                    preview: () => plugin.render.preview(store.config),
                    move: () => plugin.render.move(store.config)
                }}/>
            </EditableStateContext.Provider>
        </PluginStoreContext.Provider>
}

export const PreviewPlugin = (props: ComponentProps) => {

}
