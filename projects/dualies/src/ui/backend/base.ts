export interface IBackendCollectionWrapper<Key, T, Query> {
    count(): Promise<number>
    query(query: Query): Promise<T[]>
    get(key: Key): Promise<T>
    create(data: T): Promise<Key>
    update(key: Key, data: Partial<T>): Promise<void>
    delete(key: Key): Promise<void>
}
