import { DBinding, memoryBinding } from "@pltk/components";
import { createContext } from "react";
import { createNullableContext } from "../backend/hooks/utils";
import { EditableState } from "./widgets/base";

export interface PanelSize {
    scale: number
    width: number
    height: number
}

export const EditableStateContext = createContext<DBinding<EditableState>>(memoryBinding<EditableState>(EditableState.Edit))

export const PreviewModeContext = createContext(false)

export const PanelSizeContext = createNullableContext<PanelSize>("Panel not initialized")
