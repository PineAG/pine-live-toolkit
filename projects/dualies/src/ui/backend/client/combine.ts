import { repeat, times, zip } from "lodash"
import { error } from "../utils"
import { IBackendCollectionWrapper } from "./base"

export interface IBackendCollectionBaseWrapper<Key, T> {
    getOrUndefined(id: Key): Promise<T | undefined>
    batch(idList: Key[]): Promise<(T | undefined)[]>
    createWithKey(key: Key, data: T): Promise<void>
    update(key: Key, data: T): Promise<void>
    delete(key: Key): Promise<void>
}

export interface IBackendCollectionIdAdaptor<Key> {
    create(callback: (key: Key) => Promise<void>): Promise<Key>
    delete(key: Key): Promise<void>
    update(key: Key): Promise<void>
}

export interface IBackendCollectionFilter<Key, Query> {
    query(query: Query): Promise<Key[]>
}

type PartitionOptionsBase<Key extends KeyBase, T extends Record<string, any>> = Record<string, Key["name"] | keyof T>

export interface MultiBackendCollectionAdapterOptions<Key extends KeyBase, T extends Record<string, any>, Query, Partitions extends PartitionOptionsBase<Key, T>> {
    index: {
        name: Key["name"]
        collection: IBackendCollectionIdAdaptor<Key["type"]>
    }
    query: IBackendCollectionFilter<ResolveKey<Key["type"]>, Query>
    partitions: {[K in keyof Partitions]: Partitions[K][]}
    collections: {
        [K in keyof T]: IBackendCollectionBaseWrapper<Key["type"], T[K]>
    }
    hooks?: {
        beforeDelete?: (key: Key["type"]) => Promise<void>
        afterDelete?: (key: Key["type"]) => Promise<void>
    }
}

type PartitionsMapping<Key extends KeyBase, T extends Record<string, any>, Partitions extends PartitionOptionsBase<Key, T>> = {
    [K in keyof Partitions]: Pick<T & ResolveKey<Key>, Partitions[K]>
}

type QueryPartitionsResult<Key extends KeyBase, T extends Record<string, any>, Partitions extends PartitionOptionsBase<Key, T>, P extends keyof Partitions> = {[E in keyof Partitions]: {[F in Partitions[E]]: (T & ResolveKey<Key>)[F]}}[P][]

type KeyBase = {name: string, type: any}
type ResolveKey<Key extends KeyBase> = Record<Key["name"], Key["type"]>

export class MultiBackendCollectionAdapter<Key extends KeyBase, T extends Record<string, any>, Query, Partitions extends PartitionOptionsBase<Key, T>> implements IBackendCollectionWrapper<ResolveKey<Key>, T, Query, PartitionsMapping<Key, T, Partitions>> {
    constructor(private options: MultiBackendCollectionAdapterOptions<Key, T, Query, Partitions>) {}
    async query(query: Query): Promise<(T & ResolveKey<Key>)[]> {
        const idList = await this.options.query.query(query)
        return await this.batch(idList) as (T & ResolveKey<Key>)[]
    }
    async queryPartition<P extends keyof Partitions>(query: Query, partition: P): Promise<QueryPartitionsResult<Key, T, Partitions, P>> {
        const idList = await this.options.query.query(query)
        const keys = this.options.partitions[partition]
        return await this.batch<Partitions[P]>(idList, keys)
    }
    private mergeEntries<P extends keyof T | Key["name"]>(keys: P[], values: (T[P] | undefined)[]): Pick<T & ResolveKey<Key>, P> | undefined {
        const item: Partial<T> = {}
        for(const [k, v] of zip(keys, values)) {
            if(v === undefined) {
                return undefined
            }
            item[k as keyof T] = v
        }
        return item as T
    }
    private itemKeys(): (keyof T | Key["name"])[] {
        return Object.keys(this.options.collections)
    }
    async get(idObj: ResolveKey<Key>): Promise<T & ResolveKey<Key>> {
        const id = idObj[this.options.index.name]
        const keys = this.itemKeys()
        const values = await Promise.all(keys.map(k => this.options.collections[k].getOrUndefined(id)))
        return this.mergeEntries(keys, values) ?? error(`Not found: ${id}`)
    }
    private async batch<P extends keyof T | Key["name"]>(idList: Key["type"][], partitions?: P[]): Promise<(T & ResolveKey<Key>)[P][]> {
        const keys = partitions ?? this.itemKeys() as P[]
        const results = await Promise.all(keys.map(async k => {
            const values = k === this.options.index.name ? idList : await this.options.collections[k].batch(idList)
            return {key: k, values}
        }))
        if(results.length === 0) {
            return []
        }
        const len = results[0].values.length
        return times(len, i => {
            const item: Partial<(T & ResolveKey<Key>)[P]> = {}
            for(const r of results) {
                if(r.values[i] === undefined) return undefined;
                item[r.key] = r.values[i]
            }
            return item as (T & ResolveKey<Key>)[P] | undefined
        }).filter(it => it !== undefined) as (T & ResolveKey<Key>)[P][]
    }
    async create(data: T): Promise<ResolveKey<Key>> {
        const keys = this.itemKeys()
        const id = await this.options.index.collection.create(async newKey => {
            await Promise.all(keys.map(async k => {
                const value: undefined | T[keyof T] = data[k]
                if(value !== undefined) {
                    await this.options.collections[k].createWithKey(newKey, value)
                }
            }))
        })
        return {[this.options.index.name]: id} as ResolveKey<Key>
    }
    async update(idObj: ResolveKey<Key>, data: Partial<T>): Promise<void> {
        const id = idObj[this.options.index.name]
        const keys = this.itemKeys()
        await Promise.all(keys.map(async k => {
            const value: undefined | T[keyof T] = data[k]
            if(value !== undefined) {
                await this.options.collections[k].update(id, value)
            }
        }))
        await this.options.index.collection.update(id)
    }
    async delete(idObj: ResolveKey<Key>): Promise<void> {
        const id = idObj[this.options.index.name]
        await this.options.hooks?.beforeDelete?.call(null, id)
        const keys = this.itemKeys()
        await this.options.index.collection.delete(id)
        await Promise.all(keys.map(async k => {
            await this.options.collections[k].delete(id)
        }))
        await this.options.hooks?.afterDelete?.call(null, id)
    }
}
