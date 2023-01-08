import { SubscriptionEvent } from "@pltk/protocol"
import Koa from "koa"
import SocketIO from "socket.io"
import Router from "koa-router"

import { emitMessage } from "./subscription"
import { error } from "./utils"
import { ServerSideDataWrapper } from "./facade"
import { isId, isPanel, isRect, isWidget, isWidgetMeta } from "./schema"

type Ctx = Koa.ParameterizedContext<any, Router.IRouterParamContext<any, any>, any>

export function initializeRouter(app: Koa, io: SocketIO.Server) {
    const api = new ServerSideDataWrapper(io)

    const router = new Router({
        prefix: "/data"
    })

    function emitUpdateMessage(evt: SubscriptionEvent) {
        emitMessage(io, evt)
    }

    function parsePanelId(ctx: Ctx): number {
        const s = ctx.params["panelId"] ?? error("Missing panel ID")
        return parseInt(s)
    }

    function parseWidgetId(ctx: Ctx): number {
        const s = ctx.params["widgetId"] ?? error("Missing widget ID")
        return parseInt(s)
    }

    function invalidBody(ctx: Ctx) {
        ctx.status = 400
        ctx.state = "Bad Request"
        ctx.body = "Invalid Object"
    }

    router.get("/", async (ctx, next) => {
        ctx.body = "OK"
    })

    // getPanels
    router.get("/panels", async (ctx, next) => {
        const panels = await api.getPanels()
        ctx.body = JSON.stringify(panels)
    })

    // createPanel
    router.post("/panels", async (ctx, next) => {
        const item = JSON.parse(ctx.request.rawBody)
        if(isPanel(item)) {
            const res = await api.createPanel(item)
            ctx.body = JSON.stringify(res)
        } else {
            invalidBody(ctx)
        }
    })

    // getPanel
    router.get("/panel/:panelId", async (ctx, next) => {
        const panelId = parsePanelId(ctx)
        const result = await api.getPanel(panelId)
        ctx.body = JSON.stringify(result)
    })

    // deletePanel
    router.delete("/panel/:panelId", async (ctx, next) => {
        const panelId = parsePanelId(ctx)
        await api.deletePanel(panelId)
        const result = true
        ctx.body = JSON.stringify(result)
    })

    // getWidgetsOfPanel
    router.get("/panel/:panelId/widgets", async (ctx, next) => {
        const panelId = parsePanelId(ctx)
        const result = await api.getWidgetsOfPanel(panelId)
        ctx.body = JSON.stringify(result)
    })

    // createWidget
    router.post("/panel/:panelId/widgets", async (ctx, next) => {
        const panelId = parsePanelId(ctx)
        const item = JSON.parse(ctx.request.rawBody)
        if(isWidget(item)) {
            const res = await api.createWidget(panelId, item)
            ctx.body = JSON.stringify(res)
        } else {
            invalidBody(ctx)
        }
    })

    // getWidgetMeta
    router.get("/panel/:panelId/widget/:widgetId/meta", async (ctx, next) => {
        const panelId = parsePanelId(ctx)
        const widgetId = parseWidgetId(ctx)
        const result = await api.getWidgetMeta(panelId, widgetId)
        ctx.body = JSON.stringify(result)
    })
    

    // setWidgetMeta
    router.put("/panel/:panelId/widget/:widgetId/meta", async (ctx, next) => {
        const panelId = parsePanelId(ctx)
        const widgetId = parseWidgetId(ctx)
        const item = JSON.parse(ctx.request.rawBody)
        if(isWidgetMeta(item)) {    
            const result = await api.setWidgetMeta(panelId, widgetId, item)
            ctx.body = JSON.stringify(result)
        } else {
            invalidBody(ctx)
        }
    })

    // getWidgetRect
    router.get("/panel/:panelId/widget/:widgetId/rect", async (ctx, next) => {
        const panelId = parsePanelId(ctx)
        const widgetId = parseWidgetId(ctx)
        const result = await api.getWidgetRect(panelId, widgetId)
        ctx.body = JSON.stringify(result)
    })

    // setWidgetRect
    router.put("/panel/:panelId/widget/:widgetId/rect", async (ctx, next) => {
        const panelId = parsePanelId(ctx)
        const widgetId = parseWidgetId(ctx)
        const item = JSON.parse(ctx.request.rawBody)
        if(isRect(item)) {    
            const result = await api.setWidgetRect(panelId, widgetId, item)
            ctx.body = JSON.stringify(result)
        } else {
            invalidBody(ctx)
        }
    })

    // getWidgetConfig
    router.get("/panel/:panelId/widget/:widgetId/config", async (ctx, next) => {
        const panelId = parsePanelId(ctx)
        const widgetId = parseWidgetId(ctx)
        const result = await api.getWidgetConfig(panelId, widgetId)
        ctx.body = JSON.stringify(result)
    })

    // setWidgetConfig
    router.get("/panel/:panelId/widget/:widgetId/config", async (ctx, next) => {
        const panelId = parsePanelId(ctx)
        const widgetId = parseWidgetId(ctx)
        const item = JSON.parse(ctx.request.rawBody)
        const result = await api.setWidgetConfig(panelId, widgetId, item)
        ctx.body = JSON.stringify(result)
    })

    app.use(router.routes()).use(router.allowedMethods())
}
