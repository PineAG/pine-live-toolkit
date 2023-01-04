import { Plugin, PropsWithConfig } from "./base"
import { IFileClient, useFileClient, useFileId } from "../store"
import Loading from "../components/Loading"
import { Checkbox, DangerButton, DBinding, FormItem, Grid, Icons, IconSwitch, propertyBinding, Stack, UploadButton } from "@dualies/components"
import { useRef } from "react"

export interface Config {
    fileId: string | null
    visible: boolean
}

function EmptyImageIcon({onClick}: {onClick?: () => void}) {
    return <div onClick={onClick} style={{opacity: 0.5, placeItems: "center", display: "grid", width: "100%", height: "100%"}}>
        <Icons.Image size="large"/>
    </div>
}

function renderImage(url: string, opacity?: number, onClick?: () => void) {
    return <div
        onClick={onClick}
        style={{
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            width: "100%", height: "100%",
            backgroundPosition: "center",
            position: "absolute",
            left: 0, top: 0,
            opacity,
            backgroundImage: `url('${url}')`
        }}
    />
}

function ImageViewer({configStore}: PropsWithConfig<Config>) {
    const fileURL = useFileId(configStore.value.fileId)
    if(configStore.value.fileId === null) {
        return <EmptyImageIcon/>
    }
    if(fileURL === null) {
        return <Loading/>
    }
    if(!configStore.value.visible) {
        return <div/>
    }
    return renderImage(fileURL)
}

async function uploadFile(file: File, client: IFileClient): Promise<string | null> {
    const res = await file.stream().getReader().read()
    if(res.value){
        const fileId = await client.create(new Blob([res.value]))
        return fileId
    } else {
        return null
    }
}

function VisibleSwitch({binding}: {binding: DBinding<boolean>}) {
    return <IconSwitch
        binding={binding}
        enabledIcon={<Icons.Show/>}
        disabledIcon={<Icons.Hide/>}
        style={{position: "absolute", right: 0, bottom: 0}}
    />
}

function ImageViewerEdit({configStore}: PropsWithConfig<Config>) {
    const fileClient = useFileClient()
    const ref = useRef<HTMLInputElement>(null)
    const fileURL = useFileId(configStore.value.fileId)
    const fileIdBinding = propertyBinding(configStore, "fileId")
    async function onChangeInternal(files: FileList | null) {
        if(files === null || files.length === 0) return;
        const file = files[0]
        const newId = await uploadFile(file, fileClient)
        await fileIdBinding.update(newId)
    }
    function onClick() {
        if(ref.current !== null){
            ref.current.click()
        }
    }
    const fileHandler = <input ref={ref} type="file" style={{display: "none"}} accept="image/*" onChange={evt => onChangeInternal(evt.target.files)}></input>
    if(configStore.value.fileId === null) {
        return <>
            <EmptyImageIcon onClick={onClick}/>
            {fileHandler}
        </>
    }
    if(fileURL === null) {
        return <Loading/>
    }
    return <>
        {renderImage(fileURL, configStore.value.visible ? 1 : 0.2, onClick)}
        <VisibleSwitch binding={propertyBinding(configStore, "visible")}/>
        {fileHandler}
    </>
}

function ImageViewerMove({configStore}: PropsWithConfig<Config>) {
    const fileURL = useFileId(configStore.value.fileId)
    if(configStore.value.fileId === null) {
        return <EmptyImageIcon/>
    }
    if(fileURL === null) {
        return <Loading/>
    }
    return renderImage(fileURL, configStore.value.visible ? 1 : 0.2)
}

function ImageViewerConfig({configStore}: PropsWithConfig<Config>) {
    const fileClient = useFileClient()
    const fileIdStore = propertyBinding(configStore, "fileId")
    const fileURL = useFileId(fileIdStore.value)
    return <Stack>
            <Grid container style={{width: "100%"}}>
                <Grid span={5}>
                    <UploadButton
                        acceptFiles="image/*"
                        icon={<Icons.Upload/>}
                        onChange={async (files) => {
                            if(files === null) return;
                            const file = files[0]
                            if(!file) return;
                            await fileIdStore.update(null)
                            await fileIdStore.update(await uploadFile(file, fileClient))
                        }}
                    >
                        上传图片
                    </UploadButton>
                </Grid>
                <Grid span={4}>
                    <FormItem label="显示图片">
                        <Checkbox binding={propertyBinding(configStore, "visible")}/>
                    </FormItem>
                </Grid>
                <Grid span={3}>
                    <DangerButton icon={<Icons.Delete/>} onClick={() => fileIdStore.update(null)}>删除图片</DangerButton>
                </Grid>
            </Grid>
            <>
                {fileURL ? <img src={fileURL}></img> : null}
            </>
        </Stack>
}

export const ImageViewerPlugin: Plugin<Config> = {
    title: "图片展示框",
    type: "builtin.imageViewer",
    initialize: {
        defaultSize: () => ({width: 200, height: 200}),
        defaultConfig: () => ({fileId: null, visible: true})
    },
    render: {
        config: (configStore) => <ImageViewerConfig configStore={configStore}/>,
        move: (configStore) => <ImageViewerMove configStore={configStore}/>,
        edit: (configStore) => <ImageViewerEdit configStore={configStore}/>,
        preview: (configStore) => <ImageViewer configStore={configStore}/>
    }
}

export default ImageViewerPlugin
