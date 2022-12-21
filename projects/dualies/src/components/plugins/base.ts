import * as rnd from "react-rnd"

export interface PluginProps {
    panelId: number
    componentId: number
}

export enum EditableState {
    Edit = "edit",
    Move = "move"
}
