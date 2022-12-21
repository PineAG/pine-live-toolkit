import { Plugin } from "./base"
import {Image as ImageIcon} from "@mui/icons-material"
import { FileClient, useFileId } from "../store"
import Loading from "../components/Loading"
import { Button, Grid } from "@mui/material"
import {UploadFile as UploadIcon} from "@mui/icons-material"
import { useState } from "react"

export interface Config {
    fileId: string | null
}

function ImageViewer({config}: {config: Config}) {
    const fileURL = useFileId(config.fileId)
    if(config.fileId === null) {
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

function ImageViewerConfig({config, setConfig}: {config: Config, setConfig: (c:Config) => void}) {
    const fileURL = useFileId(config.fileId)
    return <>
        <Grid container>
            <Grid xs={12}>
                <Button startIcon={<UploadIcon/>} variant="contained" component="label">
                    上传文件
                    <input 
                        hidden accept="image/*" type="file" 
                        onChange={async (evt) => {
                            const file = evt.target.files?.item(0)
                            if(!file) return;
                            setConfig({...config, fileId: null})
                            const res = await file.stream().getReader().read()
                            if(res.value){
                                const fileId = await new FileClient().upload(res.value)
                                setConfig({...config, fileId})
                            }
                        }}/>
                </Button>
            </Grid>
            <Grid xs={12}>
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
        config: (config, setConfig) => <ImageViewerConfig config={config} setConfig={setConfig}/>,
        move: (config) => <ImageViewer config={config}/>,
        edit: (config) => <ImageViewer config={config}/>,
        preview: (config) => <ImageViewer config={config}/>
    }
}

export default ImageViewerPlugin
