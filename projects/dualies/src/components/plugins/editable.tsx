import { ButtonGroup, IconButton } from "@mui/material"
import { ReactNode, useState, CSSProperties, useContext } from "react"
import { EditableStateContext, PanelSizeContext, PluginStoreContext, useNotNullContext } from "../context"
import { EditableState } from "./base"
import { ResizableFramework, ScaledFramework } from "./frameworks"
import {
    OpenWith as MoveIcon,
    Edit as EditIcon,
    DeleteForever as DeleteIcon,
    Done as DoneIcon
} from "@mui/icons-material"
import { Rect, Size } from "../../store"

export type EditableBodyRenderer = {
    [K in EditableState]: () => ReactNode
}

function getEditableSwitchStyle(pluginSize: Rect, panelSize: Size): CSSProperties {
    const pluginCenterX = pluginSize.x + pluginSize.width / 2
    const pluginCenterY = pluginSize.y + pluginSize.height / 2
    const panelCenterX = panelSize.width / 2
    const panelCenterY = panelSize.height / 2
    const left = pluginCenterX < panelCenterX
    const top = pluginCenterY < panelCenterY
    const style: CSSProperties = {position: "absolute"}
    style[left ? "right" : "left"] = 0
    style[top ? "bottom" : "top"] = 0
    return style
}

export const EditableSwitch = () => {
    const {state, setState} = useContext(EditableStateContext);
    const panelSize = useContext(PanelSizeContext)
    const {size: pluginRect} = useNotNullContext(PluginStoreContext)
    const style = getEditableSwitchStyle(pluginRect, panelSize)
    if(state === EditableState.Preview) {
        return <ButtonGroup style={style}>
            <IconButton size="small">
                <DeleteIcon/>
            </IconButton>
            <IconButton size="small">
                <EditIcon/>
            </IconButton>
            <IconButton size="small" onClick={() => setState(EditableState.Move)}>
                <MoveIcon/>
            </IconButton>
        </ButtonGroup>
    } else {
        return <ButtonGroup style={style}>
            <IconButton size="small" onClick={() => setState(EditableState.Preview)}>
                <DoneIcon/>
            </IconButton>
        </ButtonGroup>
    }
}

export interface EditableBodyProps {
    render: EditableBodyRenderer
}

export const EditableBody = (props: EditableBodyProps) => {
    const store = useNotNullContext(PluginStoreContext)
    const {state} = useContext(EditableStateContext)
    const content = props.render[state]()
    const editableSwitch = <EditableSwitch/>
    if(state === EditableState.Move) {
        return <ResizableFramework
                rect={store.size}
                onSizeChanged={store.resize}
                attachments={editableSwitch}
            >
            {content}
        </ResizableFramework>
    } else {
        return <ScaledFramework
            rect={store.size}
            attachments={editableSwitch}
        >
            {content}
        </ScaledFramework>
    }
}