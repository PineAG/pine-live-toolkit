import { DangerButton, DBinding, Flex, FormItem, Grid, Icons, IconSwitch, Loading, propertyBinding, Switch, UploadButton } from "@pltk/components"
import { ILiveToolkitFileStorage } from "@pltk/protocol"
import { useRef } from "react"
import { WidgetDefinition, readFileToBlob, useFileId, useLiveToolkitFileStorage, useWidgetConfigInternal } from "@pltk/core"

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

function ImageViewer() {
    const configBinding = useWidgetConfigInternal<Config>()
    const fileResult = useFileId(configBinding.value.fileId)
    if(!configBinding.value.visible) {
        return <div/>
    }
    if(fileResult.status === "Loaded") {
        return renderImage(fileResult.url)
    } else if (fileResult.status === "Pending") {
        return <Loading/>
    } else {
        return <EmptyImageIcon/>
    }
}

async function uploadFile(file: File, client: ILiveToolkitFileStorage): Promise<string> {
    const blob = await readFileToBlob(file)
    const fileId = await client.create(blob)
    return fileId
}

function VisibleSwitch({binding}: {binding: DBinding<boolean>}) {
    return <IconSwitch
        binding={binding}
        enabledIcon={<Icons.Show/>}
        disabledIcon={<Icons.Hide/>}
        style={{position: "absolute", right: 0, bottom: 0}}
    />
}

function ImageViewerEdit() {
    const configBinding = useWidgetConfigInternal<Config>()
    const fileClient = useLiveToolkitFileStorage()
    const ref = useRef<HTMLInputElement>(null)
    const fileResult = useFileId(configBinding.value.fileId)
    const fileIdBinding = propertyBinding(configBinding, "fileId")
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
    if(configBinding.value.fileId === null) {
        return <>
            <EmptyImageIcon onClick={onClick}/>
            {fileHandler}
        </>
    }
    if(fileResult.status === "Loaded"){
        return <>
            {renderImage(fileResult.url, configBinding.value.visible ? 1 : 0.2, onClick)}
            <VisibleSwitch binding={propertyBinding(configBinding, "visible")}/>
            {fileHandler}
        </>
    }else if(fileResult.status === "Pending") {
        return <Loading/>
    } else {
        return <EmptyImageIcon/>
    }
}

function ImageViewerMove() {
    const configBinding = useWidgetConfigInternal<Config>()
    const fileResult = useFileId(configBinding.value.fileId) 
    if (fileResult.status === "Loaded") {
        return renderImage(fileResult.url, configBinding.value.visible ? 1 : 0.2)
    } else if(fileResult.status === "Pending") {
        return <Loading/>
    } else {
        return <EmptyImageIcon/>
    }
}

function ImageViewerConfig() {
    const configBinding = useWidgetConfigInternal<Config>()
    const fileClient = useLiveToolkitFileStorage()
    const fileIdStore = propertyBinding(configBinding, "fileId")
    const fileResult = useFileId(fileIdStore.value)
    async function onFileChange(files: FileList | null) {
        if(files === null) return;
        const file = files[0]
        if(!file) return;
        await fileIdStore.update(null)
        await fileIdStore.update(await uploadFile(file, fileClient))
    }
    return <Flex>
            <Grid container style={{width: "100%"}}>
                <Grid span={5}>
                    <UploadButton
                        acceptFiles="image/*"
                        icon={<Icons.Upload/>}
                        onChange={onFileChange}
                    >
                        上传图片
                    </UploadButton>
                </Grid>
                <Grid span={7}>
                    <Flex alignment="end" spacing={20}>
                        <FormItem label="显示图片">
                            <Switch binding={propertyBinding(configBinding, "visible")}/>
                        </FormItem>
                        <DangerButton icon={<Icons.Delete/>} onClick={() => fileIdStore.update(null)}>删除图片</DangerButton>
                    </Flex>
                </Grid>
            </Grid>
            <>
                {fileResult.status === "Loaded" ? 
                    <img alt="" src={fileResult.url} style={{
                        maxWidth: "min(500px, 100%)",
                        minHeight: "min(500px, 100%)",
                        opacity: configBinding.value.visible ? 1 : 0.2
                    }}></img> :
                    fileResult.status === "NotFound" ?
                        <EmptyImageIcon/> :
                        <Loading/>}
            </>
        </Flex>
}

export const ImageViewerPlugin: WidgetDefinition<Config> = {
    title: "图片展示框",
    type: "builtin.imageViewer",
    initialize: {
        defaultSize: () => ({width: 200, height: 200}),
        defaultConfig: () => ({fileId: null, visible: true})
    },
    render: {
        config: () => <ImageViewerConfig/>,
        move: () => <ImageViewerMove/>,
        edit: () => <ImageViewerEdit/>,
        preview: () => <ImageViewer/>
    }
}

export default ImageViewerPlugin
