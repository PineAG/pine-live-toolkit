import { ActionButton, CardGrid, DBinding, defaultValueBinding, Dialog, Flex, FormItem, Grid, Icons, nullablePropertyBinding, NumberField, StringField, useLocalDBinding } from "@pltk/components"
import { useNavigate } from "react-router-dom"
import Loading from "../components/Loading"
import { GlobalInfo, useGlobal } from "../backend"
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

function NewPanelDialog({binding, store}: {binding: DBinding<NewPanelInfo | null>, store: GlobalInfo | null}) {
    if(store === null) return <></>;
    return <Dialog title="新建界面" open={binding.value !== null} 
        onOk={async () => {
            if(binding.value === null) return;
            const {title, width, height} = binding.value
            await store.createPanel(title, {width, height})
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

export const RenderPanelListPageBody = ({store}: {store: GlobalInfo | null}) => {
    const navigate = useNavigate()
    if(store === null){
        return <Loading/>
    }
    return <CardGrid
        columns={4}
        items={store.panels.map(p => ({
            key: p.id,
            onClick: () => navigate(`/panel/${p.id}`),
            content: (
                <span style={{fontSize: "1.8rem"}}>
                    {p.meta.title}
                </span>
            ),
        }))}
    />
}

export const PanelListPage = () => {
    const store = useGlobal()
    const newPanel = useLocalDBinding<NewPanelInfo | null>(null)
    return <div style={{margin: "50px"}}>
    <Grid container alignment="left">
        <Grid span={12}>
            <Flex>
                <ActionButton icon={<Icons.Add/>} onClick={() => newPanel.update(defaultNewPanel())}>创建新面板</ActionButton>
            </Flex>
        </Grid>
        <Grid span={12}>
            <RenderPanelListPageBody store={store}/>
        </Grid>
    </Grid>
    <NewPanelDialog binding={newPanel} store={store}/>
    </div>
}
