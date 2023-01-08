import Koa from "koa"
import Router from "koa-router"
import { ServerSideFilesStorage } from "./files";
import { error } from "./utils";
import * as uuid from "uuid"
import rawBody from "raw-body";

type Ctx = Koa.ParameterizedContext<any, Router.IRouterParamContext<any, any>, any>
export function initializeFilesRoutes(app: Koa, fileClient: ServerSideFilesStorage) {
    const router = new Router({
        prefix: "/files"
    })

    function getFileId(ctx: Ctx): string {
        const fileId = ctx.params["fileId"] ?? error("Missing panel ID")
        if(!uuid.validate(fileId)) {
            return error("Invalid ID format")
        }
        return fileId
    }

    function readRawBody(ctx: Ctx): Promise<Blob> {
        return new Promise((resolve, reject) => {
            rawBody(ctx.req, {}, (err, result) => {
                if(err){
                    reject(err)
                } else {
                    const data = Buffer.from(result)
                    const blob = new Blob([data])
                    resolve(blob)
                }
            })
        })
    }
    
    router.post("/", async (ctx, next) => {
        ctx.req.readable = true
        const data = await readRawBody(ctx)
        const fileId = await fileClient.create(data as any)
        ctx.body = fileId
    })

    router.get("/:fileId", async (ctx, next) => {
        const fileId = getFileId(ctx)
        const blob = await fileClient.fetch(fileId)
        ctx.body = new Buffer(await blob.arrayBuffer())
    })

    router.put("/:fileId", async (ctx, next) => {
        const fileId = getFileId(ctx)
        const data = await readRawBody(ctx)
        await fileClient.update(fileId, data)
    })

    router.delete("/:fileId", async (ctx, next) => {
        const fileId = getFileId(ctx)
        await fileClient.delete(fileId)
    })

    app.use(router.routes()).use(router.allowedMethods())
}