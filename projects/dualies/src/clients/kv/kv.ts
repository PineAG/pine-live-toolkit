import { IDisposable, SubscriptionCallback } from "@pltk/protocol"

export type IKVDataClientFactory = <T>(key: string) => IKVDataClient<T>

export interface IKVDataClient<T> {
    get(): Promise<T | null>
    set(data: T): Promise<void>
    delete(): Promise<void>
}

export type IKVSubscriptionFactory = (key: string) => IKVSubscriptionClient

export interface IKVSubscriptionClient{
    subscribe(callback: SubscriptionCallback): IDisposable
}

export interface IKVFileClient {
    create(data: string | Blob): Promise<string>
    update(id: string, data: string | Blob): Promise<void>
    read(id: string): Promise<Blob>
    delete(id: string): Promise<void>
}
