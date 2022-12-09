import { TransparentBackground } from "../components/backgrounds"
import Loading from "../components/Loading"
import { KeepRatio } from "../components/panels/KeepRatio"
import { EditablePlugin } from "../components/plugins"
import { Rect, usePanel } from "../store"
import { usePanelId } from "./utils"
import "./Panel.css"
import { PanelElementSizeContext, PanelStoreContext } from "../components/context"
import { useRef, useState } from "react"
import { Button, ButtonGroup, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, Select, Typography } from "@mui/material"
import {Add as AddIcon} from "@mui/icons-material"
import { enabledPlugins, enabledPluginsList } from "../plugins"


function convertDomRectToRect(rect: DOMRect | undefined): Rect {
    if(rect === undefined) {
        return {x: 0, y: 0, width: 1, height: 1}
    }
    const {width, height, x, y} = rect
    return {width, height, x, y}
}



export const PanelPage = () => {
    const panelId = usePanelId()
    const panel = usePanel(panelId)
    const [newPluginType, setNewPluginType] = useState<string | null>(null)
    const ref = useRef<HTMLDivElement>(null)
    if(!panel){
        return <Loading/>
    }
    return <div className="route-panel-root">
        <Grid container className="route-panel-header">
            <Grid xs={6}>
                <Typography>{panel.meta.title}</Typography>
            </Grid>
            <Grid xs={6}>
                <ButtonGroup variant="contained">
                    <Button startIcon={<AddIcon/>} onClick={() => setNewPluginType(enabledPluginsList[0].type)}>新建组件</Button>
                </ButtonGroup>
            </Grid>
        </Grid>
        <div className="route-panel-body" ref={ref}>
            <PanelStoreContext.Provider value={panel}>
            <PanelElementSizeContext.Provider value={convertDomRectToRect(ref.current?.getBoundingClientRect())}>
            <KeepRatio internalSize={panel.size}>
                <TransparentBackground/>
                <>
                {panel.pluginsList.map(pluginId => (
                    <EditablePlugin
                        key={pluginId}
                        panelId={panelId}
                        pluginId={pluginId}
                    />
                ))}
                </>
            </KeepRatio>
            </PanelElementSizeContext.Provider>
            </PanelStoreContext.Provider>
        </div>
        <Dialog open={newPluginType !== null} onClose={() => setNewPluginType(null)}>
            <DialogTitle>新建组件</DialogTitle>
            <DialogContent>
                <Select
                    value={newPluginType}
                    onChange={(evt) => {setNewPluginType(evt.target.value)}}
                >
                    {enabledPluginsList.map(plugin => (
                        <MenuItem value={plugin.type}>{plugin.title}</MenuItem>
                    ))}
                </Select>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setNewPluginType(null)}>取消</Button>
                <Button onClick={async () => {
                    if(newPluginType === null) return;
                    const plugin = enabledPlugins[newPluginType]
                    await panel.createPlugin(plugin.type, {x: 0, y: 0, ...plugin.initialize.defaultSize()}, plugin.initialize.defaultConfig())
                    setNewPluginType(null)
                }}>创建</Button>
            </DialogActions>
        </Dialog>
    </div>
}
