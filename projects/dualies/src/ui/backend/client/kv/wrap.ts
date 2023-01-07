import { IBackendCollectionBaseWrapper, IBackendCollectionFilter, IBackendCollectionIdAdaptor } from "../combine";
import { IKVDataClient } from "./base";

export interface KeyValueIdAdaptorOptions {
    counter: IKVDataClient<number>
    idList: IKVDataClient<number[]>
}

export class KVIdAdaptor implements IBackendCollectionIdAdaptor<number> {
    constructor(protected options: KeyValueIdAdaptorOptions) {}
    async create(callback: (key: number) => Promise<void>): Promise<number> {
        const newKey = await this.options.counter.get() ?? 0
        const currentList = await this.options.idList.get() ?? []
        await callback(newKey)
        currentList.push(newKey)
        await this.options.idList.set(currentList)
        await this.options.counter.set(newKey+1)
        return newKey
    }
    async delete(key: number): Promise<void> {
        const currentList = await this.options.idList.get() ?? []
        const nextList = currentList.filter(id => id !== key)    
        await this.options.idList.set(nextList)
    }
    async update(key: number): Promise<void> {
        const currentList = await this.options.idList.get() ?? []
        await this.options.idList.set(currentList)
    }
}

export class KVRootFilter implements IBackendCollectionFilter<number, undefined> {
    constructor(private kv: IKVDataClient<number[]>) {}
    async query(query: undefined): Promise<number[]> {
        return await this.kv.get() ?? []
    }
}

export class KVReverseIndexFilter<Query> implements IBackendCollectionFilter<number, Query> {
    constructor(private kvFactory: (query: Query) => IKVDataClient<number[]>) {}
    async query(query: Query): Promise<number[]> {
        return await this.kvFactory(query).get() ?? []
    }
}

export class KVDataAdaptor<T> implements IBackendCollectionBaseWrapper<number, T> {
    constructor(private kvFactory: (id: number) => IKVDataClient<T>) {}
    async getOrUndefined(id: number): Promise<T | undefined> {
        const value = await this.kvFactory(id).get()
        return value ?? undefined
    }
    async batch(idList: number[]): Promise<(T | undefined)[]> {
        return await Promise.all(idList.map(id => this.getOrUndefined(id)))
    }
    async createWithKey(key: number, data: T): Promise<void> {
        await this.kvFactory(key).set(data)
    }
    async update(key: number, data: T): Promise<void> {
        await this.kvFactory(key).set(data)
    }
    async delete(key: number): Promise<void> {
        await this.kvFactory(key).delete()
    }
}
