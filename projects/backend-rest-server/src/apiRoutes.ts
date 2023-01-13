import Koa from "koa"
import Router from "koa-router"
import {koaBody} from "koa-body"

import { error } from "./utils"
import { isNewWarehouse, isPanel, isPanelMeta, isRect, isSize, isWarehouseMeta, isWidget, isWidgetMeta } from "./schema"
import { DataSubscriptionWrapper } from "./subscription"

type Ctx = Koa.ParameterizedContext<any, Router.IRouterParamContext<any, any>, any>

export function initializeAPIRouter(app: Koa, api: DataSubscriptionWrapper) {
    const router = new Router({
        prefix: "/api/data"
    })

    function parsePanelId(ctx: Ctx): number {
        const s = ctx.params["panelId"] ?? error("Missing panel ID")
        return parseInt(s)
    }

    function parseWidgetId(ctx: Ctx): number {
        const s = ctx.params["widgetId"] ?? error("Missing widget ID")
        return parseInt(s)
    }

    function parseWarehouseType(ctx: Ctx): string {
        return ctx.params["warehouseType"] ?? error("Missing warehouse type")
    }

    function parseWarehouseId(ctx: Ctx): number {
        const s = ctx.params["warehouseId"] ?? error("Missing warehouse ID")
        return parseInt(s)
    }

    async function handleError(ctx: Ctx, next: Koa.Next) {
        try {
            await next()
        }catch(e) {
            ctx.status = 500
            ctx.body = e.toString()
            console.warn(e)
        }
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

    // getWarehouse
    router.get("/warehouses/:warehouseType", async (ctx, next) => {
        const warehouseType = parseWarehouseType(ctx)
        const result = await api.getWarehouseList(warehouseType)
        ctx.body = JSON.stringify(result)
    })

    // getWarehouseList
    router.get("/warehouse/:warehouseType/:warehouseId", async (ctx, next) => {
        const warehouseType = parseWarehouseType(ctx)
        const warehouseId = parseWarehouseId(ctx)
        const result = await api.getWarehouse(warehouseType, warehouseId)
        ctx.body = JSON.stringify(result)
    })

    // createWarehouse
    router.post("/warehouses/:warehouseType", koaBody(), async (ctx, next) => {
        const warehouseType = parseWarehouseType(ctx)
        const item = ctx.request.body
        if(isNewWarehouse(item)) {
            const result = await api.createWarehouse(warehouseType, item)
            ctx.body = JSON.stringify(result)
        } else {
            invalidBody(ctx)
        }

    })

    // getWarehouseMeta
    router.get("/warehouse/:warehouseType/:warehouseId/meta", koaBody(), async (ctx, next) => {
        const warehouseType = parseWarehouseType(ctx)
        const warehouseId = parseWarehouseId(ctx)
        const result = await api.getWarehouseMeta(warehouseType, warehouseId)
        ctx.body = JSON.stringify(result)
    })

    // getWarehouseConfig
    router.get("/warehouse/:warehouseType/:warehouseId/config", koaBody(), async (ctx, next) => {
        const warehouseType = parseWarehouseType(ctx)
        const warehouseId = parseWarehouseId(ctx)
        const result = await api.getWarehouseConfig(warehouseType, warehouseId)
        ctx.body = JSON.stringify(result)
    })

    // setWarehouseMeta
    router.put("/warehouse/:warehouseType/:warehouseId/meta", koaBody(), async (ctx, next) => {
        const warehouseType = parseWarehouseType(ctx)
        const warehouseId = parseWarehouseId(ctx)
        const item = ctx.request.body
        if(isWarehouseMeta(item)) {
            await api.setWarehouseMeta(warehouseType, warehouseId, item)
            ctx.body = "true"
        } else {
            invalidBody(ctx)
        }
    })

    // setWarehouseConfig
    router.put("/warehouse/:warehouseType/:warehouseId/config", koaBody(), async (ctx, next) => {
        const warehouseType = parseWarehouseType(ctx)
        const warehouseId = parseWarehouseId(ctx)
        const item = ctx.request.body
        await api.setWarehouseConfig(warehouseType, warehouseId, item)
        ctx.body = "true"
    })

    // deleteWarehouse
    router.del("/warehouse/:warehouseType/:warehouseId", async (ctx, next) => {
        const warehouseType = parseWarehouseType(ctx)
        const warehouseId = parseWarehouseId(ctx)
        await api.deleteWarehouse(warehouseType, warehouseId)
        ctx.body = "true"
    })


    app.use(router.routes()).use(router.allowedMethods())
}
