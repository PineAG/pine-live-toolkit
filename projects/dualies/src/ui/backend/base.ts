export interface IBackendItemWrapper<Key, T> {

}

export interface IBackendCollectionWrapper<Key, FullObject, IndexObject, IndexQuery> {
    count(): Promise<number>
    queryIndex(query: IndexQuery): Promise<IndexObject[]>
    item(key: Key): IBackendItemWrapper<Key, FullObject>
}
