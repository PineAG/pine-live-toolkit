import { ButtonGroup, Dialog, DialogTitle, IconButton, DialogContent, DialogActions, Button, DialogContentText } from "@mui/material"
import { ReactNode, useState, CSSProperties, useContext } from "react"
import { EditableStateContext, PanelSizeContext, PanelStoreContext, PluginStoreContext, useNotNullContext } from "../context"
import { EditableState } from "./base"
import { ResizableFramework, ScaledFramework } from "./frameworks"
import {
    OpenWith as MoveIcon,
    Edit as EditIcon,
    DeleteForever as DeleteIcon,
    Done as DoneIcon
} from "@mui/icons-material"
import { PluginClient, Rect, Size } from "../../store"
import { enabledPlugins } from "../../plugins"

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
    const plugin = useNotNullContext(PluginStoreContext)
    const {state, setState} = useContext(EditableStateContext);
    const panelSize = useContext(PanelSizeContext)
    const {size: pluginRect} = useNotNullContext(PluginStoreContext)
    const style = getEditableSwitchStyle(pluginRect, panelSize)
    const [onDelete, setOnDelete] = useState(false)
    const [onEditConfig, setOnEditConfig] = useState<any | null>(null)

    const pluginTemplate = enabledPlugins[plugin.meta.pluginType]

    if(state === EditableState.Preview) {
        return <>
        <ButtonGroup style={style}>
            <IconButton onClick={() => setOnDelete(true)} size="small">
                <DeleteIcon/>
            </IconButton>
            <IconButton onClick={() => setOnEditConfig(plugin.config)} size="small">
                <EditIcon/>
            </IconButton>
            <IconButton size="small" onClick={() => setState(EditableState.Move)}>
                <MoveIcon/>
            </IconButton>
        </ButtonGroup>
        <Dialog open={onDelete} onClose={() => setOnDelete(false)} fullWidth>
            <DialogTitle>删除组件</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    确认要删除组件吗？
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button color="inherit" onClick={() => setOnDelete(false)}>取消</Button>
                <Button color="error" onClick={async () => {
                    await plugin.delete()
                    setOnDelete(false)
                }}>删除组件</Button>
            </DialogActions>
        </Dialog>

        <Dialog fullWidth open={onEditConfig !== null} onClose={() => setOnEditConfig(null)}>
            <DialogTitle>设置组件 {pluginTemplate.title}</DialogTitle>
            <DialogContent style={{paddingTop: "20px", paddingBottom: "20px"}}>
                {onEditConfig && pluginTemplate.render.config(onEditConfig, (newConfig) => {setOnEditConfig(newConfig)})}
            </DialogContent>
            <DialogActions>
                <Button color="inherit" onClick={() => setOnEditConfig(null)}>取消</Button>
                <Button color="primary" onClick={async () => {
                    if(onEditConfig !== null) {
                        await plugin.setConfig(onEditConfig)
                    }
                    setOnEditConfig(null)
                }}>保存</Button>
            </DialogActions>
        </Dialog>
        </>
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