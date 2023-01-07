type QueryPartitionsBase = Record<string, any>

export interface IBackendCollectionWrapper<Key extends Record<string, any>, T extends Record<string, any>, Query, QueryPartitions extends QueryPartitionsBase = {}> {
    get(id: Key): Promise<T & Key>
    query(query: Query): Promise<(T & Key)[]>
    queryPartition<P extends keyof QueryPartitions>(query: Query, partition: P): Promise<QueryPartitions[P][]>
    create(data: T): Promise<Key>
    update(key: Key, data: Partial<T>): Promise<void>
    delete(key: Key): Promise<void>
}

export type SubscriptionDisposer = {close: () => void}

export interface IBackendSubscriptionWrapper<Key> {
    onCountChanged(listener: () => void): SubscriptionDisposer
    onItemChanged(key: Key, listener: () => void): SubscriptionDisposer
}

export interface IFileClient {
    create(data: string | Blob): Promise<string>
    update(id: string, data: string | Blob): Promise<void>
    read(id: string): Promise<Blob>
    delete(id: string): Promise<void>
}