import * as Koa from "koa"
import * as Websockify from "koa-websocket"
import * as ws from "ws"
import { v4 as uuid4 } from "uuid"
import * as BodyParser from "koa-bodyparser"
// import mockData from "./mockData"

const app = Websockify(new Koa())
app.use(BodyParser())

const globalDataListeners: Map<string, Set<ws>> = new Map();
const globalDataStore: Map<string, any> = new Map()
const globalFileStore: Map<string, any> = new Map()

app.ws.use(async (ctx, next) => {
    console.log("WS", ctx.path)
    const path = ctx.path.replace(/^\/data/, "")
    if (!globalDataListeners.has(path)) {
        globalDataListeners.set(path, new Set())
    }
    globalDataListeners.get(path).add(ctx.websocket)
    ctx.websocket.on("close", () => {
        globalDataListeners.get(path).delete(ctx.websocket)
    })
    // return next()
})

app.use(async (ctx) => {
    console.log("HTTP", ctx.path)
    if (ctx.path.startsWith("/data")) {
        const path = ctx.path.replace(/^\/data/, "")
        const method = ctx.method
        ctx.status = 200
        ctx.body = ""
        if (method === "GET") {
            if(globalDataStore.has(path)) {
                ctx.body = globalDataStore.get(path)
            } else {
                ctx.status = 404
            }
        } else if (method === "PUT" || method === "POST") {
            const data = ctx.req.read()
            globalDataStore.set(path, data)
            emitPathUpdateNotification(path, "SET")
        } else if (method === "DELETE") {
            globalDataStore.delete(path)
            emitPathUpdateNotification(path, "DELETE")
        } else {
            ctx.status = 405
        }
    } else if (ctx.path.startsWith("/files")) {
        const path = ctx.path.replace(/^\/files/, "")
        const method = ctx.method
        ctx.status = 200
        if (method === "GET") {
            console.log(path)
            if (globalFileStore.has(path)) {
                const data = globalFileStore.get(path)
                ctx.body = data
            } else {
                ctx.status = 404
            }
        } else if (method === "POST" && (path === "/" || path === "")) {
            const id = uuid4()
            globalFileStore.set(`/${id}`, ctx.req.read())
            ctx.body = id
        } else if (method === "PUT") {
            globalFileStore.set(path, ctx.req.read())
        } else if (method === "DELETE") {
            globalFileStore.delete(path)
        } else {
            ctx.status = 405
        }
    } else {
        ctx.status = 404
    }
})

type NotificationTypes = "SET" | "DELETE"

function emitPathUpdateNotification(path: string, action: NotificationTypes) {
    const listeners = globalDataListeners.get(path)
    if (!listeners) return;
    for (const w of listeners) {
        w.send(action)
    }
}

app.use(async ctx => {
    ctx.body = ctx.request.URL.pathname
})

// for(const [k, v] of Object.entries(mockData)) {
//     globalDataStore.set(k, JSON.stringify(v))
// }

app.listen(3001)
