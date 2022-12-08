import { ButtonGroup, IconButton } from "@mui/material"
import { ReactNode, useState, CSSProperties, useContext } from "react"
import { EditableStateContext, PluginStoreContext, useNotNullContext } from "../context"
import { EditableState } from "./base"
import { ResizableFramework, ScaledFramework } from "./frameworks"
import {
    OpenWith as MoveIcon,
    Edit as EditIcon,
    DeleteForever as DeleteIcon,
    Done as DoneIcon
} from "@mui/icons-material"

export type EditableBodyRenderer = {
    [K in EditableState]: () => ReactNode
}

const styleEditableSwitch: CSSProperties = {
    position: 'absolute',
    right: 0,
    bottom: 0
}

export const EditableSwitch = () => {
    const {state, setState} = useContext(EditableStateContext);
    if(state === EditableState.Preview) {
        return <ButtonGroup style={styleEditableSwitch}>
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
        return <ButtonGroup style={styleEditableSwitch}>
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