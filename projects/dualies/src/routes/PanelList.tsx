import { Dialog, Grid, Icons, nullablePropertyBinding, defaultValueBinding, propertyBinding, StringField, useLocalDBinding, FormItem, NumberField } from "@dualies/components"
import { ButtonBase, Card } from "@mui/material"
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
    return <Grid span={2}>
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
    const newPanel = useLocalDBinding<NewPanelInfo | null>(null)
    if(!store){
        return <Loading/>
    }
    return <>
    <Grid container alignment="left">
        <ListButton onClick={() => newPanel.update(defaultNewPanel())}>
            <Icons.Add size="middle"/>
        </ListButton>
        {store.panels.map(p => (
            <ListButton onClick={() => navigate(`/panel/${p.id}`)}>
                <span style={{fontSize: "1.8rem"}}>
                    {p.title}
                </span>
            </ListButton>
        ))}
    </Grid>
    <Dialog title="新建界面" open={newPanel.value !== null} 
        onOk={async () => {
            if(newPanel.value === null) return;
            const {title, width, height} = newPanel.value
            await store.createPanel(title, {width, height})
            newPanel.update(null)
        }} 
        onCancel={() => newPanel.update(null)}>
            <Grid container>
                <Grid span={12}>
                    <FormItem label="标题">
                        <StringField
                            binding={defaultValueBinding<string>(nullablePropertyBinding(newPanel, "title"), "")}
                        />
                    </FormItem>
                </Grid>
                <Grid span={6}>
                    <FormItem label="宽度">
                        <NumberField
                            binding={defaultValueBinding<number>(nullablePropertyBinding(newPanel, "width"), 1)}
                        />
                    </FormItem>
                </Grid>
                <Grid span={6}>
                    <FormItem label="高度">
                        <NumberField
                            binding={defaultValueBinding<number>(nullablePropertyBinding(newPanel, "height"), 1)}
                        />
                    </FormItem>
                </Grid>
            </Grid>
    </Dialog>
    </>
}
