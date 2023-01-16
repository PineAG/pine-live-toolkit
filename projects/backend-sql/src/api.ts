import {ILiveToolkitClient, INewWarehouse, IPanel, IPanelMeta, IPanelReference, IWarehouse, IWarehouseMeta, IWarehouseReference, IWidget, IWidgetMeta, IWidgetReference, Rect, Size} from "@pltk/protocol"
import {DataSource} from "typeorm"
import * as models from "./models";

export class ServerSideDataWrapper implements ILiveToolkitClient {
    constructor(private dataSource: DataSource) {}

    private get panels() {
        return this.dataSource.getRepository(models.Panel)
    }

    private get widgets() {
        return this.dataSource.getRepository(models.Widget)
    }

    private get warehouses(){
        return this.dataSource.getRepository(models.Warehouse)
    }

    async getPanels(): Promise<IPanelReference[]> {
        const result = await this.panels.find({
            select: ["id", "meta"]
        })
        return result.map(it => ({id: it.id, meta: it.meta}))
    }
    async getPanel(panelId: number): Promise<IPanel> {
        const {meta, size} = await this.panels.findOne({
            select: ["meta", "size"],
            where: [{id: panelId}]
        })
        return {meta, size}
    }
    async createPanel(panel: IPanel): Promise<number> {
        const result = await this.panels.insert([panel])
        return result.identifiers[0].id
    }
    async deletePanel(panelId: number): Promise<void> {
        const panel = await this.panels.findOne({where: [{id: panelId}], select: ["id"]})
        await this.widgets.delete({panel})
        await this.panels.delete({id: panelId})
    }
    async setPanelMeta(panelId: number, meta: IPanelMeta): Promise<void> {
        const item = await this.panels.findOne({where: {id: panelId}})
        item.meta = meta
        await this.panels.save(item)
    }
    async setPanelSize(panelId: number, size: Size): Promise<void> {
        const item = await this.panels.findOne({where: {id: panelId}})
        item.size = size
        await this.panels.save(item)
    }
    async getWidgetsOfPanel(panelId: number): Promise<IWidgetReference[]> {
        const result = await this.panels.findOne({
            where: [{id: panelId}],
            select: ["widgets"],
            relations: {
                widgets: true
            }
        })
        return result.widgets.map(it => ({
            id: it.id,
            meta: it.meta
        }))
    }
    async getWidgetMeta(panelId: number, widgetId: number): Promise<IWidgetMeta> {
        const result = await this.widgets.findOne({
            where: [{id: widgetId}],
            select: ["meta"]
        })
        return result.meta
    }
    async getWidgetRect(panelId: number, widgetId: number): Promise<Rect> {
        const result = await this.widgets.findOne({
            where: [{id: widgetId}],
            select: ["rect"]
        })
        return result.rect
    }
    async getWidgetConfig<C>(panelId: number, widgetId: number): Promise<C> {
        const result = await this.widgets.findOne({
            where: [{id: widgetId}],
            select: ["config"]
        })
        return result.config
    }
    async createWidget<Config>(panelId: number, widget: IWidget<Config>): Promise<number> {
        const panel = await this.panels.findOne({select: ["id"], where: [{id: panelId}]})
        const newWidget = new models.Widget()
        newWidget.meta = widget.meta
        newWidget.rect = widget.rect
        newWidget.config = widget.config
        newWidget.panel = panel
        const result = await this.widgets.save(newWidget)
        return result.id
    }
    async deleteWidget(panelId: number, widgetId: number): Promise<void> {
        await this.widgets.delete({id: widgetId})
    }
    async setWidgetMeta(panelId: number, widgetId: number, meta: IWidgetMeta): Promise<void> {
        const item = await this.widgets.findOne({where: {id: widgetId}})
        item.meta = meta
        await this.widgets.save(item)
    }
    async setWidgetRect(panelId: number, widgetId: number, rect: Rect): Promise<void> {
        const item = await this.widgets.findOne({where: {id: widgetId}})
        item.rect = rect
        await this.widgets.save(item)
    }
    async setWidgetConfig<Config>(panelId: number, widgetId: number, config: Config): Promise<void> {
        const item = await this.widgets.findOne({where: {id: widgetId}})
        item.config = config
        await this.widgets.save(item)
    }
    
    async getWarehouseList<C>(type: string): Promise<IWarehouseReference[]> {
        const items = await this.warehouses.find({where: [{type}], select: ["id", "meta"]})
        return items.map(it => ({
            id: it.id,
            meta: it.meta
        }))
    }
    async getWarehouse<C>(type: string, id: number): Promise<IWarehouse<C>> {
        const item = await this.warehouses.findOne({where: [{type, id}], select: ["id", "meta", "config"]})
        return {
            id,
            type,
            meta: item.meta,
            config: item.config
        }
    }
    async createWarehouse<C>(type: string, {meta, config}: INewWarehouse<C>): Promise<number> {
        const result = await this.warehouses.insert([{type, meta, config: config as any}])
        return result.identifiers[0].id
    }

    async getWarehouseMeta(type: string, id: number): Promise<IWarehouseMeta> {
        const item = await this.warehouses.findOne({where: [{type, id}], select: ["meta"]})
        return item.meta
    }

    async getWarehouseConfig<C>(type: string, id: number): Promise<C> {
        const item = await this.warehouses.findOne({where: [{type, id}], select: ["config"]})
        return item.config
    }

    async setWarehouseMeta(type: string, id: number, meta: IWarehouseMeta): Promise<void> {
        const item = await this.warehouses.findOne({where: [{type, id}]})
        item.meta = meta
        await this.warehouses.save(item)
    }
    async setWarehouseConfig<C>(type: string, id: number, config: C): Promise<void> {
        const item = await this.warehouses.findOne({where: [{type, id}]})
        item.config = config
        await this.warehouses.save(item)
    }
    async deleteWarehouse(type: string, id: number): Promise<void> {
        await this.warehouses.delete({type, id})
    }
}
