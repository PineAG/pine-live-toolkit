import { SubscriptionEvent, SubscriptionManager } from "@pltk/client"

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
    read(id: string): Promise<Blob>
    delete(id: string): Promise<void>
}

export interface IBackend {
    data<T>(path: string): IDataClient<T>
    files(): IFileClient
}

export async function readFileToBlob(file: File): Promise<Blob> {
    const reader = file.stream().getReader()
    const blobParts: Uint8Array[] = []
    let res = await reader.read()
    while(!res.done) {
        blobParts.push(res.value)
        res = await reader.read()
    }
    if(res.value !== undefined) {
        blobParts.push(res.value)
    }
    return new Blob(blobParts)
}
