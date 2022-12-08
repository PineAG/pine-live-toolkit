import { createContext, Context, useContext, useState } from "react";
import { PluginInfo } from "../store";
import { EditableState } from "./plugins/base";

export interface PanelSize {
    scale: number
    width: number
    height: number
}

export const PanelSizeContext = createContext<PanelSize>({scale: 1, width: 1920, height: 1080})

export const PluginStoreContext = createContext<PluginInfo | null>(null)

export function useNotNullContext<T>(context: Context<T|null>): T {
    const value = useContext(context)
    if(value === null) {
        throw new Error("Context not initialized")
    }
    return value
}


export interface StateManager<T> {
    state: T
    setState: (s: T) => void
}

export function emptyStateManager<T>(defaultState: T): StateManager<T> {
    return {state: defaultState, setState: (s: T) => {}}
}

export function useStateManager<T>(defaultValue: T): StateManager<T> {
    const [state, setState] = useState(defaultValue)
    return {state, setState}
}

export const EditableStateContext = createContext(emptyStateManager<EditableState>(EditableState.Preview))
