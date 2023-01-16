import { IPanel, IPanelMeta, IWarehouse, IWarehouseMeta, IWidget, IWidgetMeta, Rect, Size } from "@pltk/protocol"
import {Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne} from "typeorm"

@Entity()
export class Panel implements IPanel {
    @PrimaryGeneratedColumn()
    id: number

    @Column("simple-json")
    meta: IPanelMeta

    @Column("simple-json")
    size: Size

    @OneToMany(type => Widget, widget => widget.panel)
    widgets: Widget[]
}

@Entity()
export class Widget implements IWidget<any> {
    @PrimaryGeneratedColumn()
    id: number

    @Column("simple-json")
    meta: IWidgetMeta

    @Column("simple-json")
    rect: Rect

    @Column("simple-json")
    config: any

    @ManyToOne(type => Panel, panel => panel.widgets)
    panel: Panel
}

@Entity()
export class Warehouse implements IWarehouse<any> {
    @PrimaryGeneratedColumn()
    id: number

    @Column("simple-json")
    meta: IWarehouseMeta

    @Column()
    type: string

    @Column("simple-json")
    config: any
}
