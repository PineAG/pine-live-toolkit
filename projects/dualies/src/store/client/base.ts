import { SubscriptionEvent, SubscriptionManager } from "@dualies/client"

export interface IDataClient<T> {
    get(): Promise<T | null>
    set(data: T): Promise<void>
    delete(): Promise<void>
    subscribe(callback: (evt: SubscriptionEvent) => void): SubscriptionManager
    onValueChanged(callback: (value: T|null) => void): SubscriptionManager
}

export interface IFileClient {
    create(data: string | Blob): Promise<string>
    update(id: string, data: string | Blob): Promise<void>
    readBlob(id: string): Promise<Uint8Array>
    readAsObjectURL(id: string): Promise<string>
    delete(id: string): Promise<void>
}

export interface IBackend {
    data<T>(path: string): IDataClient<T>
    files(): IFileClient
}
