import SocketIO from "socket.io"
import {ILiveToolkitClient, IPanel, IPanelMeta, IPanelReference, IWidget, IWidgetMeta, IWidgetReference, Rect, Size, SubscriptionEvent} from "@pltk/protocol"
import { emitMessage } from "./subscription";
import {DataSource} from "typeorm"
import * as models from "./models";

export class ServerSideDataWrapper implements ILiveToolkitClient {
    constructor(private io: SocketIO.Server, private dataSource: DataSource) {}

    private notify(evt: SubscriptionEvent) {
        emitMessage(this.io, evt)
    }

    private get panels() {
        return this.dataSource.getRepository(models.Panel)
    }

    private get widgets() {
        return this.dataSource.getRepository(models.Widget)
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
        this.notify({
            type: "PanelList",
            parameters: {}
        })
        return result.identifiers[0].id
    }
    async deletePanel(panelId: number): Promise<void> {
        await this.panels.delete({id: panelId})
        this.notify({
            type: "PanelList",
            parameters: {}
        })
    }
    async setPanelMeta(panelId: number, meta: IPanelMeta): Promise<void> {
        await this.panels.update({id: panelId}, {meta})
        this.notify({
            type: "Panel",
            parameters: {panelId}
        })
    }
    async setPanelSize(panelId: number, size: Size): Promise<void> {
        await this.panels.update({id: panelId}, {size})
        this.notify({
            type: "Panel",
            parameters: {panelId}
        })
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
        this.notify({
            type: "WidgetListOfPanel",
            parameters: {panelId}
        })
        return result.id
    }
    async deleteWidget(panelId: number, widgetId: number): Promise<void> {
        await this.widgets.delete({id: widgetId})
        this.notify({
            type: "WidgetListOfPanel",
            parameters: {panelId}
        })
    }
    async setWidgetMeta(panelId: number, widgetId: number, meta: IWidgetMeta): Promise<void> {
        await this.widgets.update({id: widgetId}, {meta})
        this.notify({
            type: "WidgetListOfPanel",
            parameters: {panelId}
        })
    }
    async setWidgetRect(panelId: number, widgetId: number, rect: Rect): Promise<void> {
        await this.widgets.update({id: widgetId}, {rect})
        this.notify({
            type: "WidgetRect",
            parameters: {panelId, widgetId}
        })
    }
    async setWidgetConfig<Config>(panelId: number, widgetId: number, config: Config): Promise<void> {
        await this.widgets.update({id: widgetId}, {config: config as any})
        this.notify({
            type: "WidgetConfig",
            parameters: {panelId, widgetId}
        })
    }

}