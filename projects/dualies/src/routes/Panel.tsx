import { TransparentBackground } from "../components/backgrounds"
import Loading from "../components/Loading"
import { KeepRatio } from "../components/panels/KeepRatio"
import { EditablePlugin } from "../components/plugins"
import { Rect, usePanel } from "../store"
import { usePanelId } from "./utils"
import "./Panel.css"
import { PanelElementSizeContext, PanelStoreContext } from "../components/context"
import { useRef, useState } from "react"
import { Alert, Button, ButtonGroup, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, Select, Snackbar, Typography } from "@mui/material"
import {Add as AddIcon, Share as ShareIcon} from "@mui/icons-material"
import { enabledPlugins, enabledPluginsList } from "../plugins"


function convertDomRectToRect(rect: DOMRect | undefined): Rect {
    if(rect === undefined) {
        return {x: 0, y: 0, width: 1, height: 1}
    }
    const {width, height, x, y} = rect
    return {width, height, x, y}
}

function ShareButton() {
    const [open, setOpen] = useState(false)
    async function copyLink() {
        const url = `${window.location.href}/exhibition`
        await navigator.clipboard.writeText(url)
        setOpen(true)
    }
    return <>
        <Button startIcon={<ShareIcon/>} onClick={copyLink}>
            展示页链接
        </Button>
        <Snackbar open={open} autoHideDuration={3000} onClose={() => setOpen(false)}>
            <Alert severity="success">已复制展示页链接</Alert>
        </Snackbar>
    </>
}


export const PanelPage = () => {
    const panelId = usePanelId()
    const panel = usePanel(panelId)
    const [newPluginType, setNewPluginType] = useState<string | null>(null)
    const ref = useRef<HTMLDivElement>(null)
    if(!panel){
        return <Loading/>
    }
    console.log(ref.current)
    const panelBody = ref.current === null ? null : (
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
    )
    return <div className="route-panel-root">
        <Grid container className="route-panel-header">
            <Grid xs={6}>
                <Typography>{panel.meta.title}</Typography>
            </Grid>
            <Grid xs={6}>
                <ButtonGroup variant="contained">
                    <Button startIcon={<AddIcon/>} onClick={() => setNewPluginType(enabledPluginsList[0].type)}>添加组件</Button>
                    <ShareButton/>
                </ButtonGroup>
            </Grid>
        </Grid>
        <div className="route-panel-body" ref={ref}>
            <PanelStoreContext.Provider value={panel}>
            {panelBody}
            </PanelStoreContext.Provider>
        </div>
        <Dialog fullWidth open={newPluginType !== null} onClose={() => setNewPluginType(null)}>
            <DialogTitle>添加组件</DialogTitle>
            <DialogContent>
                <Grid container>
                    <Grid xs={12}>
                    <Select
                        fullWidth
                        value={newPluginType}
                        onChange={(evt) => {setNewPluginType(evt.target.value)}}
                    >
                        {enabledPluginsList.map(plugin => (
                            <MenuItem key={plugin.type} value={plugin.type}>{plugin.title}</MenuItem>
                        ))}
                    </Select>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button color="inherit" onClick={() => setNewPluginType(null)}>取消</Button>
                <Button color="primary" onClick={async () => {
                    if(newPluginType === null) return;
                    const plugin = enabledPlugins[newPluginType]
                    await panel.createPlugin(plugin.type, {x: 0, y: 0, ...plugin.initialize.defaultSize()}, plugin.initialize.defaultConfig())
                    setNewPluginType(null)
                }}>创建</Button>
            </DialogActions>
        </Dialog>
    </div>
}
