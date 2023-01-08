import { ActionButton, CardGrid, DBinding, defaultValueBinding, Dialog, Flex, FormItem, Grid, Icons, nullablePropertyBinding, NumberField, StringField, useLocalDBinding } from "@pltk/components"
import { useNavigate } from "react-router-dom"
import { useLiveToolkitClient, usePanels } from "../backend"
import { unwrapAsyncSubs } from "../components/subs"
import "./PanelList.css"


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

function NewPanelDialog({binding}: {binding: DBinding<NewPanelInfo | null>}) {
    const client = useLiveToolkitClient()
    return <Dialog title="新建界面" open={binding.value !== null} 
        onOk={async () => {
            if(binding.value === null) return;
            const {title, width, height} = binding.value
            await client.createPanel({
                meta: { title },
                size: {width, height}
            })
            binding.update(null)
        }} 
        onCancel={() => binding.update(null)}>
            <Grid container>
                <Grid span={12}>
                    <FormItem label="标题">
                        <StringField
                            binding={defaultValueBinding<string>(nullablePropertyBinding(binding, "title"), "")}
                        />
                    </FormItem>
                </Grid>
                <Grid span={6}>
                    <FormItem label="宽度">
                        <NumberField
                            binding={defaultValueBinding<number>(nullablePropertyBinding(binding, "width"), 1)}
                        />
                    </FormItem>
                </Grid>
                <Grid span={6}>
                    <FormItem label="高度">
                        <NumberField
                            binding={defaultValueBinding<number>(nullablePropertyBinding(binding, "height"), 1)}
                        />
                    </FormItem>
                </Grid>
            </Grid>
    </Dialog>
}

export const RenderPanelListPageBody = () => {
    const navigate = useNavigate()
    const panelsReq = usePanels()
    return unwrapAsyncSubs(panelsReq, panels => (
    <CardGrid
        columns={4}
        items={panels.map(p => ({
            key: p.id,
            onClick: () => navigate(`/panel/${p.id}`),
            content: (
                <span style={{fontSize: "1.8rem"}}>
                    {p.meta.title}
                </span>
            ),
        }))}
    />
    ))
}

export const PanelListPage = () => {
    const newPanel = useLocalDBinding<NewPanelInfo | null>(null)
    return <div style={{margin: "50px"}}>
    <Grid container alignment="left">
        <Grid span={12}>
            <Flex>
                <ActionButton icon={<Icons.Add/>} onClick={() => newPanel.update(defaultNewPanel())}>创建新面板</ActionButton>
            </Flex>
        </Grid>
        <Grid span={12}>
            <RenderPanelListPageBody/>
        </Grid>
    </Grid>
    <NewPanelDialog binding={newPanel}/>
    </div>
}
