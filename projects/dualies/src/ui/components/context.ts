import { DBinding, memoryBinding } from "@pltk/components";
import { Rect, Size } from "@pltk/protocol";
import { createContext } from "react";
import { createNullableContext } from "../backend/hooks/utils";
import { EditableState } from "./widgets/base";

export interface PanelSize {
    scale: number
    configSize: Size
    actualRect: Rect
}

export const EditableStateContext = createContext<DBinding<EditableState>>(memoryBinding<EditableState>(EditableState.Edit))

export const PreviewModeContext = createContext(false)

export const PanelSizeContext = createNullableContext<PanelSize>("Panel not initialized")
