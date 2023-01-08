import { ILiveToolkitFileStorage } from "@pltk/protocol";
import fs from "fs/promises"
import path from "path";
import * as uuid from "uuid"

export class ServerSideFilesStorage implements ILiveToolkitFileStorage {
    private initializePromise: Promise<any>
    constructor(private root: string) {
        this.initializePromise = fs.mkdir(root, {recursive: true})
    }

    private path(name: string): string {
        return path.resolve(this.root, `${name}.bin`)
    }

    async create(data: Blob): Promise<string> {
        await this.initializePromise
        const id = uuid.v4()
        await this.update(id, data)
        return id
    }
    async fetch(id: string): Promise<Blob> {
        await this.initializePromise
        const buffer = await fs.readFile(this.path(id))
        return new Blob([buffer])
    }
    async update(id: string, data: Blob): Promise<void> {
        await this.initializePromise
        const buffer = await data.arrayBuffer()
        await fs.writeFile(this.path(id), new Uint8Array(buffer))
    }
    async delete(id: string): Promise<void> {
        await this.initializePromise
        await fs.unlink(this.path(id))
    }
}
