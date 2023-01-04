import { SubscriptionEvent, SubscriptionManager } from "@dualies/client";
import * as idb from "idb";
import { IBackend, IDataClient, IFileClient } from "./base";

const BROADCAST_CHANNEL_NAME = "dualise.mock.notification"

module DBWrapper {
    const IndexedDBName = "dualies.mock.db:data_kv"
    const DataStoreName = "data_kv"
    const FileStoreName = "file_kv"

    async function openInternal(dbName: string) {
        const db = await idb.openDB(dbName, 1, {
            upgrade(db) {
                db.createObjectStore(DataStoreName)
                db.createObjectStore(FileStoreName)
            }
        })
        return db
    }

    async function getInternal<T>(dbName: string, storeName: string, key: string): Promise<T | null> {
        const db = await openInternal(dbName)
        const tx = db.transaction(storeName, "readonly", {})
        const value = await tx.store.get(key)
        await tx.done
        return value ?? null
    }

    async function putInternal<T>(dbName: string, storeName: string, key: string, value: T): Promise<void> {
        const db = await openInternal(dbName)
        const tx = db.transaction(storeName, "readwrite", {})
        await tx.store.put(value, key)
        await tx.done
        db.close()
    }

    async function deleteInternal(dbName: string, storeName: string, key: string): Promise<void> {
        const db = await openInternal(dbName)
        const tx = db.transaction(storeName, "readwrite")
        await tx.store.delete(key)
        await tx.done
        db.close()
    }

    class DBAccess<T> {
        constructor(private dbName: string, private storeName: string, private key: string) {}
        async get(): Promise<T | null> {
            return await getInternal(this.dbName, this.storeName, this.key)
        }
        async set(value: T): Promise<void> {
            await putInternal(this.dbName, this.storeName, this.key, value)
        }
        async delete(): Promise<void> {
            await deleteInternal(this.dbName, this.storeName, this.key)
        }
    }

    export function data<T>(key: string): DBAccess<T> {
        return new DBAccess(IndexedDBName, DataStoreName, key)
    }

    export function file(key: string): DBAccess<Blob> {
        return new DBAccess(IndexedDBName, FileStoreName, key)
    }

    export function destroyDB(): Promise<void> {
        return idb.deleteDB(IndexedDBName)
    }
}

class IndexedDBDataClient<T> implements IDataClient<T> {

    constructor(private key: string) {}

    private broadcastMessage(event: SubscriptionEvent) {
        const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME)
        bc.postMessage({event, key: this.key})
        bc.close()
    }

    private get db() {
        return DBWrapper.data<T>(this.key)
    }

    async get(): Promise<T | null> {
        console.log("GET", this.key)
        return await this.db.get()
    }
    async set(data: T): Promise<void> {
        console.log("SET", this.key)
        await this.db.set(data)
        this.broadcastMessage("SET")
    }
    async delete(): Promise<void> {
        console.log("DEL", this.key)
        await this.db.delete()
        this.broadcastMessage("DELETE")
    }

    subscribe(callback: (evt: SubscriptionEvent) => void): SubscriptionManager {
        const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME)
        bc.onmessage = (message) => {
            const event = message.data["event"]
            const key = message.data["key"]
            console.log("SUB", key)
            if(key === this.key && (event === "SET" || event === "DELETE")) {
                callback(event)
            }
        }
        return {
            close: () => bc.close()
        }
    }
    onValueChanged(callback: (value: T | null) => void): SubscriptionManager {
        const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME)
        bc.onmessage = async (message) => {
            const key = message.data["key"]
            console.log("SUB", key)
            if(key === this.key) {
                const value = await this.db.get()
                callback(value)
            }
        }
        return {
            close: () => bc.close()
        }
    }
}

class IndexedDBFileClient implements IFileClient {
    async create(data: string | Blob): Promise<string> {
        const uuid = crypto.randomUUID()
        await this.update(uuid, data)
        return uuid
    }

    private db(path: string) {
        return DBWrapper.file(path)
    }

    async update(id: string, data: string | Blob): Promise<void> {
        console.log("FILE WRITE", id)
        const raw = typeof data === "string" ?
            new Blob([new TextEncoder().encode(data)]) :
            data
        await this.db(id).set(raw)

    }
    async read(id: string): Promise<Blob> {
        console.log("FILE READ", id)
        const data = await this.db(id).get()
        if(data === null) {
            throw new Error(`Not found: ${data}`)
        }
        return data
    }
    async delete(id: string): Promise<void> {
        await this.db(id).delete()
    }    
}

export class BrowserStorageBackend implements IBackend {
    data<T>(path: string): IndexedDBDataClient<T> {
        return new IndexedDBDataClient(path)
    }
    files(): IndexedDBFileClient {
        return new IndexedDBFileClient()
    }
}

export async function clearIndexedDBBackendData() {
    await DBWrapper.destroyDB()
}
