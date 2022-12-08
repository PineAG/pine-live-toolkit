import * as rnd from "react-rnd"

export interface PluginProps {
    panelId: number
    componentId: number
}

export enum EditableState {
    Preview = "preview",
    Move = "move"
}
