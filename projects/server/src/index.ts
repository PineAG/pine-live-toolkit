import "reflect-metadata"
import {createServer} from "http"
import Koa from "koa"

import { initializeSubscription } from "./subscription"
import { initializeRouter } from "./routes"
import { parseArguments } from "./args"
import { connectDB } from "./models"
import { ServerSideDataWrapper } from "./facade"

const args = parseArguments()
const dataSource = connectDB(args)

const app = new Koa()
const httpServer = createServer(app.callback())

const io = initializeSubscription(httpServer)
const api = new ServerSideDataWrapper(io, dataSource)
initializeRouter(app, api)
httpServer.listen(args.port, "0.0.0.0")
