import { IFileClient } from "../base"

export type SubscriptionEvent = "SET" | "DELETE"
export interface SubscriptionManager {
    close(): void
}

export interface IKVDataClient<T> {
    get(): Promise<T | null>
    set(data: T): Promise<void>
    delete(): Promise<void>
    subscribe(callback: () => void): SubscriptionManager
}



export interface IBackend {
    data<T>(path: string): IKVDataClient<T>
    files(): IFileClient
}
