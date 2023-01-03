import { SubscriptionEvent, SubscriptionManager } from "@dualies/client";
import { IBackend, IDataClient, IFileClient } from "./base";

const LOCALSTORAGE_DATA_PREFIX = "$dualies.mock/data"
const LOCALSTORAGE_FILE_PREFIX = "$dualies.mock/file"

type Subscriber = () => void

class MockBus {
    private subscribers: Map<string, Set<Subscriber>> = new Map()
    constructor() {
        window.addEventListener("storage", evt => {
            if(evt.key){
                this.emit(evt.key)
            }
        })
    }

    emit(key: string) {
        setTimeout(() => {
            const c = this.subscribers.get(key)
            if(!c) return;
            for(const s of c){
                s()
            }
        }, 10)
    }

    subscribe(key: string, subscriber: Subscriber) {
        let c = this.subscribers.get(key)
        if(!c) {
            c = new Set()
            this.subscribers.set(key, c)
        }
        c.add(subscriber)
    }

    dispose(key: string, subscriber: Subscriber) {
        const c = this.subscribers.get(key)
        if(!c) return;
        c.delete(subscriber)
        if(c.size === 0) {
            this.subscribers.delete(key)
        }
    }
}

let _globalMockBus: MockBus | null = null

function mockBus(): MockBus {
    if(_globalMockBus === null) {
        _globalMockBus = new MockBus()
    }
    return _globalMockBus
}

class MockJsonDataClient<T> implements IDataClient<T> {

    constructor(private key: string) {}

    private get path() {
        return `${LOCALSTORAGE_DATA_PREFIX}${this.key}`
    }

    async get(): Promise<T | null> {
        const data = localStorage.getItem(this.path)
        if(data !== null) {
            return JSON.parse(data)
        } else {
            return null
        }
    }
    async set(data: T): Promise<void> {
        localStorage.setItem(this.path, JSON.stringify(data))
        mockBus().emit(this.path)
    }
    async delete(): Promise<void> {
        localStorage.removeItem(this.path)
        mockBus().emit(this.path)
    }
    subscribe(callback: (evt: SubscriptionEvent) => void): SubscriptionManager {
        const subscriber = () => {
            const newValue = localStorage.getItem(this.path)
            callback(newValue ? "SET" : "DELETE")
        }
        mockBus().subscribe(this.path, subscriber)
        return {
            close: () => mockBus().dispose(this.path, subscriber)
        }
    }
    onValueChanged(callback: (value: T | null) => void): SubscriptionManager {
        const subscriber = () => {
            const newValue = localStorage.getItem(this.path)
            if(newValue === null) {
                callback(null)
            } else {
                callback(JSON.parse(newValue))
            }
        }
        mockBus().subscribe(this.path, subscriber)
        return {
            close: () => mockBus().dispose(this.path, subscriber)
        }
    }
}

class MockFileClient implements IFileClient {
    async create(data: string | Blob): Promise<string> {
        const uuid = crypto.randomUUID()
        await this.saveFile(uuid, data)
        return uuid
    }
    async update(id: string, data: string | Blob): Promise<void> {
        await this.saveFile(id, data)
    }
    async readBlob(id: string): Promise<Uint8Array> {
        const data = await this.readFile(id)
        return Uint8Array.from(data)
    }
    async readAsObjectURL(id: string): Promise<string> {
        return URL.createObjectURL(new Blob([await this.readFile(id)]))
    }
    async delete(id: string): Promise<void> {
        localStorage.removeItem(this.path(id))
    }
    path(id: string): string {
        return `${LOCALSTORAGE_FILE_PREFIX}/${id}`
    }
    private async saveFile(id: string, data: string | Blob) {
        if(typeof data === "string") {
            data = new Blob([new TextEncoder().encode(data)])
        }
        const b64 = Buffer.from(await data.arrayBuffer()).toString("base64")
        localStorage.setItem(id, b64)
    }
    private async readFile(id: string): Promise<Buffer> {
        const b64 = localStorage.getItem(this.path(id))
        if(b64 === null) {
            throw new Error(`Missing key: ${id}`)
        }
        return Buffer.from(b64, "base64")
    }
    
}

export class BrowserStorageBackend implements IBackend {
    data<T>(path: string): MockJsonDataClient<T> {
        return new MockJsonDataClient(path)
    }
    files(): MockFileClient {
        return new MockFileClient()
    }
}
