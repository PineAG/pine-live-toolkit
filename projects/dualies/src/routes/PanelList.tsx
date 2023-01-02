import { Icons } from "@dualies/components"
import { Button, ButtonBase, Card, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField } from "@mui/material"
import { ReactElement, useState } from "react"
import { useNavigate } from "react-router-dom"
import Loading from "../components/Loading"
import { PanelMeta, useGlobal } from "../store"
import "./PanelList.css"


type PageListButtonProps = {
    onClick: () => void
    children: ReactElement
}
const ListButton = (props: PageListButtonProps) => {
    return <Grid xs={4} lg={2}>
        <Card className="list-button">
            <ButtonBase className="fill" onAnimationEnd={props.onClick}>
                {props.children}
            </ButtonBase>
        </Card>
    </Grid>
}

interface NewPanelInfo {
    title: string
    width: number
    height: number
}

function defaultNewPanel(): NewPanelInfo {
    return {
        title: "新界面",
        width: 1280,
        height: 720
    }
}

export const PanelListPage = () => {
    const navigate = useNavigate()
    const store = useGlobal()
    const [newPanel, setNewPanel] = useState<NewPanelInfo | null>(null)
    if(!store){
        return <Loading/>
    }
    return <>
    <Grid container>
        <ListButton onClick={() => setNewPanel(defaultNewPanel())}>
            <Icons.Add/>
        </ListButton>
        {store.panels.map(p => (
            <ListButton onClick={() => navigate(`/panel/${p.id}`)}>
                <span style={{fontSize: "1.8rem"}}>
                    {p.title}
                </span>
            </ListButton>
        ))}
    </Grid>
    <Dialog fullWidth open={newPanel !== null} onClose={() => setNewPanel(null)}>
        <DialogTitle>新建界面</DialogTitle>
        <DialogContent>
            <Grid container>
                <Grid xs={12}>
                    <TextField
                        fullWidth
                        margin="dense"
                        autoFocus
                        type="text"
                        value={newPanel?.title ?? ""}
                        onChange={evt => newPanel && setNewPanel({...newPanel, title: evt.target.value ?? ""})}
                        label="标题"
                    />
                </Grid>
                <Grid xs={6}>
                    <TextField
                        type="number"
                        fullWidth
                        margin="dense"
                        label="宽度"
                        value={newPanel?.width}
                        onChange={evt => {
                            if(!newPanel) return;
                            const value = parseInt(evt.target.value)
                            if(isNaN(value) || value < 1){
                                return;
                            }
                            setNewPanel({...newPanel, width: value})
                        }}
                    />
                </Grid>
                <Grid xs={6}>
                    <TextField
                        type="number"
                        fullWidth
                        value={newPanel?.height}
                        margin="dense"
                        label="高度"
                        onChange={evt => {
                            if(!newPanel) return;
                            const value = parseInt(evt.target.value)
                            if(isNaN(value) || value < 1){
                                return;
                            }
                            setNewPanel({...newPanel, height: value})
                        }}
                    />
                </Grid>
            </Grid>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setNewPanel(null)}>取消</Button>
            <Button onClick={async () => {
                if(newPanel === null) return;
                const {title, width, height} = newPanel
                await store.createPanel(title, {width, height})
                setNewPanel(null)
            }}>创建</Button>
        </DialogActions>
    </Dialog>
    </>
}
