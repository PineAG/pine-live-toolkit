import { ILiveToolkitClient, ILiveToolkitFileStorage } from "@pltk/protocol"

import {createServer} from "http"
import Koa from "koa"
import KoaLogger from "koa-logger"
import KoaStatic from "koa-static"

import { DataSubscriptionWrapper, initializeSubscription } from "./subscription"
import { initializeAPIRouter } from "./apiRoutes"
import { initializeFilesRoutes } from "./filesRoutes"

export interface LiveToolkitServerOptions {
    port: number
    staticRoot?: string
    dataClient: ILiveToolkitClient
    filesClient: ILiveToolkitFileStorage
}

export function startLiveToolkitServer(options: LiveToolkitServerOptions) {
    const app = new Koa()
    app.use(KoaLogger())
    const httpServer = createServer(app.callback())
    const io = initializeSubscription(httpServer)
    const apiWrapper = new DataSubscriptionWrapper(options.dataClient, io)

    initializeAPIRouter(app, apiWrapper)
    initializeFilesRoutes(app, options.filesClient)

    if(options.staticRoot) {
        app.use(KoaStatic(options.staticRoot, {
            index: "index.html"
        }))
    }

    httpServer.listen(options.port, "0.0.0.0")
}
