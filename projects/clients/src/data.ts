import { ClientBase, ClientOptions } from "./base"

export type SubscriptionEvent = "SET" | "DELETE"

export interface SubscriptionManager {
    close(): void
}

export class RawDataClient extends ClientBase {

    async get(): Promise<Uint8Array | null> {
        const res = await fetch(this.httpPath, {
            method: "GET"
        })
        if(res.status === 404) {
            return null
        } else if (res.status === 200) {
            const r = await res.body?.getReader().read()
            if(!r){
                throw new Error("Empty body")
            }
            return r.value ?? null
        } else {
            throw new Error(`${res.status}: ${res.statusText}`)
        }
    }

    async set(data: Uint8Array) {
        const res = await fetch(this.httpPath, {
            method: "PUT",
            body: data
        })
        if(res.status !== 200) {
            throw new Error(`${res.status}: ${res.statusText}`)
        }
    }

    async delete() {
        const res = await fetch(this.httpPath, {
            method: "DELETE"
        })
        if(res.status !== 200) {
            throw new Error(`${res.status}: ${res.statusText}`)
        }
    }

    subscribe(callback: (evt: SubscriptionEvent) => void): SubscriptionManager {
        const ws = new WebSocket(this.wsPath)
        ws.onmessage = (evt: MessageEvent<SubscriptionEvent>) => {
            callback(evt.data)
        }
        return {close: () => ws.close()}
    }
}

export class JsonDataClient<T> {
    private client: RawDataClient
    constructor(opts: ClientOptions) {
        this.client = new RawDataClient(opts)
    }

    async get(): Promise<T | null> {
        const raw = await this.client.get()
        if(raw === null) {
            return null
        }
        return JSON.parse(new TextDecoder().decode(raw))
    }

    async set(data: T) {
        const raw = new TextEncoder().encode(JSON.stringify(data))
        await this.client.set(raw)
    }

    async delete() {
        await this.client.delete()
    }

    subscribe(callback: (evt: SubscriptionEvent) => void): SubscriptionManager {
        return this.client.subscribe(callback)
    }

    onValueChanged(callback: (value: T|null) => void): SubscriptionManager {
        const manager = this.subscribe(async evt => {
            let value: T | null
            if(evt === "SET") {
                value = await this.get()
            } else {
                value = null
            }
            callback(value)
        })
        this.get().then(val => callback(val))
        return manager
    }
}
