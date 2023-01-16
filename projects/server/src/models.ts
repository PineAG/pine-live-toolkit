import path from "path"
import fs from "fs/promises"
import { DataSource } from "typeorm"
import { liveToolkitModels } from "@pltk/sql-backend"



export function connectDB(sqliteDir: string): DataSource {
    const dbPath = path.resolve(sqliteDir, "pltk.db")
    const dataSource = new DataSource({
        type: "sqlite",
        database: dbPath,
        entities: liveToolkitModels,
        synchronize: true
    })
    async function initialize() {
        await fs.mkdir(sqliteDir, {recursive: true})
        await dataSource.initialize()
    }
    initialize()
    return dataSource
}
