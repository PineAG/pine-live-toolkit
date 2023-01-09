import "reflect-metadata"
import {createServer} from "http"
import Koa from "koa"
import KoaLogger from "koa-logger"
import KoaStatic from "koa-static"

import { initializeSubscription } from "./subscription"
import { initializeAPIRouter } from "./apiRoutes"
import { parseArguments } from "./args"
import { connectDB } from "./models"
import { ServerSideDataWrapper } from "./facade"
import { ServerSideFilesStorage } from "./files"
import { initializeFilesRoutes } from "./filesRoutes"

const args = parseArguments()
const dataSource = connectDB(args)

const app = new Koa()

app.use(KoaLogger())

const httpServer = createServer(app.callback())

const io = initializeSubscription(httpServer)
const api = new ServerSideDataWrapper(io, dataSource)
initializeAPIRouter(app, api)

const fileClient = new ServerSideFilesStorage(args.filesRoot)
initializeFilesRoutes(app, fileClient)

if(args.staticRoot) {
    app.use(KoaStatic(args.staticRoot, {
        index: "index.html"
    }))
}

httpServer.listen(args.port, "0.0.0.0")
