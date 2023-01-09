import Koa from "koa"
import Router from "koa-router"
import {koaBody} from "koa-body"

import { error } from "./utils"
import { ServerSideDataWrapper } from "./facade"
import { isPanel, isPanelMeta, isRect, isSize, isWidget, isWidgetMeta } from "./schema"

type Ctx = Koa.ParameterizedContext<any, Router.IRouterParamContext<any, any>, any>

export function initializeAPIRouter(app: Koa, api: ServerSideDataWrapper) {
    const router = new Router({
        prefix: "/data"
    })

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
    router.post("/panels", koaBody(), async (ctx, next) => {
        const item = ctx.request.body
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

    // setPanelMeta
    router.put("/panel/:panelId/meta", koaBody(), async (ctx, next) => {
        const panelId = parsePanelId(ctx)
        const item = ctx.request.body
        if(isPanelMeta(item)) {
            await api.setPanelMeta(panelId, item)
            ctx.body = "true"
        } else {
            invalidBody(ctx)
        }
        
    })

    // setPanelSize
    router.put("/panel/:panelId/size", koaBody(), async (ctx, next) => {
        const panelId = parsePanelId(ctx)
        const item = ctx.request.body
        if(isSize(item)) {
            await api.setPanelSize(panelId, item)
            ctx.body = "true"
        } else {
            invalidBody(ctx)
        }
    })

    // deletePanel
    router.delete("/panel/:panelId", async (ctx, next) => {
        const panelId = parsePanelId(ctx)
        await api.deletePanel(panelId)
        ctx.body = "true"
    })

    // getWidgetsOfPanel
    router.get("/panel/:panelId/widgets", async (ctx, next) => {
        const panelId = parsePanelId(ctx)
        const result = await api.getWidgetsOfPanel(panelId)
        ctx.body = JSON.stringify(result)
    })

    // createWidget
    router.post("/panel/:panelId/widgets", koaBody(), async (ctx, next) => {
        const panelId = parsePanelId(ctx)
        const item = ctx.request.body
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
    router.put("/panel/:panelId/widget/:widgetId/meta", koaBody(), async (ctx, next) => {
        const panelId = parsePanelId(ctx)
        const widgetId = parseWidgetId(ctx)
        const item = ctx.request.body
        if(isWidgetMeta(item)) {    
            api.setWidgetMeta(panelId, widgetId, item)
            ctx.body = "true"
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
    router.put("/panel/:panelId/widget/:widgetId/rect", koaBody(), async (ctx, next) => {
        const panelId = parsePanelId(ctx)
        const widgetId = parseWidgetId(ctx)
        const item = ctx.request.body
        if(isRect(item)) {    
            await api.setWidgetRect(panelId, widgetId, item)
            ctx.body = "true"
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
    router.put("/panel/:panelId/widget/:widgetId/config", koaBody(), async (ctx, next) => {
        const panelId = parsePanelId(ctx)
        const widgetId = parseWidgetId(ctx)
        const item = ctx.request.body
        await api.setWidgetConfig(panelId, widgetId, item)
        ctx.body = "true"
    })

    //deleteWidget
    router.del("/panel/:panelId/widget/:widgetId", async (ctx, next) => {
        const panelId = parsePanelId(ctx)
        const widgetId = parseWidgetId(ctx)
        await api.deleteWidget(panelId, widgetId)
        ctx.body = "true"
    })

    app.use(router.routes()).use(router.allowedMethods())
}
