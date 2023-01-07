import { IDisposable, SubscriptionCallback } from "@pltk/protocol"

export interface IKVDataClient<T> {
    get(): Promise<T | null>
    set(data: T): Promise<void>
    delete(): Promise<void>
    subscribe(callback: SubscriptionCallback): IDisposable
}

export interface IKVFileClient {
    create(data: string | Blob): Promise<string>
    update(id: string, data: string | Blob): Promise<void>
    read(id: string): Promise<Blob>
    delete(id: string): Promise<void>
}

export interface IKVBackend {
    data<T>(path: string): IKVDataClient<T>
    files(): IKVFileClient
}
