import "sqlite3"
import "blob-polyfill"
import path from "path"
import {DataSource} from "typeorm"
import fs from "fs/promises"
import {liveToolkitModels, ServerSideDataWrapper} from "@pltk/sql-backend"
import {startLiveToolkitServer} from "@pltk/restful-backend-server"
import {ServerSideFilesStorage} from "@pltk/fs-files-backend"

export class BlobPolyfill {
    size: number
    type: string

    private buffer: Buffer

    constructor(blobParts?: BlobPart[], options?: BlobPropertyBag){
        if(blobParts === undefined || blobParts.length !== 1){
            throw new Error("Not supported")
        }
        const buffer = blobParts[0]
        if(!(buffer instanceof Buffer)){
            throw new Error("Not supported")
        }
        this.buffer = buffer
    }

    async arrayBuffer(): Promise<ArrayBuffer> {
        const buffer = this.buffer
        return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
    }
    slice(start?: number, end?: number, contentType?: string): Blob {
        throw new Error("Method not implemented.")
    }
    stream(): ReadableStream<Uint8Array> {
        throw new Error("Method not implemented.")
    }
    text(): Promise<string> {
        throw new Error("Method not implemented.")
    }
}

if(!globalThis.Blob) {
    const gt = globalThis as any
    gt['Blob'] = BlobPolyfill
}

const PORT = parseInt(process.argv[2])
console.log("Using port:", JSON.stringify(PORT))

async function startServer() {
    const dbRoot = path.resolve(__dirname, "data")
    const filesRoot = path.resolve(__dirname, "files")
    await fs.mkdir(dbRoot, {recursive: true})
    await fs.mkdir(filesRoot, {recursive: true})
    const staticRoot = path.resolve(__dirname, "static")
    const dataSource = new DataSource({
        type: "sqlite",
        database: path.resolve(dbRoot, "sqlite.db"),
        entities: liveToolkitModels,
        synchronize: true
    })
    await dataSource.initialize()
    const dataClient = new ServerSideDataWrapper(dataSource)
    const filesClient = new ServerSideFilesStorage(filesRoot)
    startLiveToolkitServer({
        dataClient,
        filesClient,
        port: PORT,
        staticRoot
    })
}

startServer()
