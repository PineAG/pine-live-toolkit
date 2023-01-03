import { Plugin, PropsWithConfig } from "./base"
import {Image as ImageIcon} from "@mui/icons-material"
import { FileClient, useFileId } from "../store"
import Loading from "../components/Loading"
import { Grid, Icons, propertyBinding, UploadButton } from "@dualies/components"

export interface Config {
    fileId: string | null
}

function ImageViewer({configStore}: PropsWithConfig<Config>) {
    const fileURL = useFileId(configStore.value.fileId)
    if(configStore.value.fileId === null) {
        return <div style={{opacity: 0.5}}>
            <ImageIcon fontSize="large"/>
        </div>
    }
    if(fileURL === null) {
        return <Loading/>
    }
    return <div
        style={{
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            width: "100%", height: "100%",
            backgroundPosition: "center",
            position: "absolute",
            left: 0, top: 0,
            backgroundImage: `url('${fileURL}')`
        }}
    />
}

function ImageViewerConfig({configStore}: PropsWithConfig<Config>) {
    const fileIdStore = propertyBinding(configStore, "fileId")
    const fileURL = useFileId(fileIdStore.value)
    return <>
        <Grid container>
            <Grid span={12}>
                <UploadButton
                    acceptFiles="image/*"
                    icon={<Icons.Upload/>}
                    onChange={async (files) => {
                        const file = files[0]
                        if(!file) return;
                        await fileIdStore.update(null)
                        const res = await file.stream().getReader().read()
                        if(res.value){
                            const fileId = await new FileClient().upload(res.value)
                            await fileIdStore.update(fileId)
                        }
                    }}
                >
                    上传图片
                </UploadButton>
            </Grid>
            <Grid span={12}>
                {fileURL ? <img src={fileURL}></img> : null}
            </Grid>
        </Grid>
    </>
}

export const ImageViewerPlugin: Plugin<Config> = {
    title: "图片展示框",
    type: "builtin.imageViewer",
    initialize: {
        defaultSize: () => ({width: 200, height: 200}),
        defaultConfig: () => ({fileId: null})
    },
    render: {
        config: (configStore) => <ImageViewerConfig configStore={configStore}/>,
        move: (configStore) => <ImageViewer configStore={configStore}/>,
        edit: (configStore) => <ImageViewer configStore={configStore}/>,
        preview: (configStore) => <ImageViewer configStore={configStore}/>
    }
}

export default ImageViewerPlugin
