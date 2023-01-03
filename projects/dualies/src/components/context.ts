import { DBinding, memoryBinding } from "@dualies/components";
import { createContext, Context, useContext, useState } from "react";
import { PanelInfo, PluginInfo, Rect } from "../store";
import { EditableState } from "./plugins/base";

export interface PanelSize {
    scale: number
    width: number
    height: number
}

export const PanelStoreContext = createContext<PanelInfo | null>(null)

export const PanelSizeContext = createContext<PanelSize>({scale: 1, width: 1920, height: 1080})
export const PanelElementSizeContext = createContext<Rect>({x: 0, y: 0, width: 1, height: 1})

export const PluginStoreContext = createContext<PluginInfo | null>(null)

export function useNotNullContext<T>(context: Context<T|null>): T {
    const value = useContext(context)
    if(value === null) {
        throw new Error("Context not initialized")
    }
    return value
}

export const EditableStateContext = createContext<DBinding<EditableState>>(memoryBinding<EditableState>(EditableState.Edit))

export const PreviewModeContext = createContext(false)

export const AutoScaleContext = createContext(1)