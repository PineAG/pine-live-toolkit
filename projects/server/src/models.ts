import { IPanel, IPanelMeta, IWidget, IWidgetMeta, Rect, Size } from "@pltk/protocol"
import path from "path"
import {Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, DataSource} from "typeorm"
import fs from "fs/promises"

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


export function connectDB(sqliteDir: string): DataSource {
    const dbPath = path.resolve(sqliteDir, "pltk.db")
    const dataSource = new DataSource({
        type: "sqlite",
        database: dbPath,
        entities: [
            Panel, Widget
        ],
        synchronize: true
    })
    async function initialize() {
        await fs.mkdir(sqliteDir, {recursive: true})
        await dataSource.initialize()
        dataSource.getRepository(Panel)
    }
    initialize()
    return dataSource
}
