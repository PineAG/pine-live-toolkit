import {createServer} from "http"
import Koa from "koa"

import { initializeSubscription } from "./subscription"
import { initializeRouter } from "./routes"
import { parseArguments } from "./args"

const app = new Koa()
const httpServer = createServer(app.callback())
const args = parseArguments()
const io = initializeSubscription(httpServer)
initializeRouter(app, io)
httpServer.listen(args.port, "0.0.0.0")
