import {useState} from "react"

export interface DStore<T> {
    value: T
    update: (value: T) => Promise<void>
}

interface CreateDStoreProps<T> {
    value: T
    update: (value: T) => void | Promise<void>
}

export function createDStore<T>({value, update}: CreateDStoreProps<T>) : DStore<T> {
    return {
        value, 
        update: async v => update(v),
    }
}

export function createReadonlyDStore<T>(value: T) : DStore<T> {
    return createDStore({value, update: () => {}})
}

export function useLocalDStore<T>(defaultValue: T): DStore<T> {
    const [value, update] = useState(defaultValue)
    return createDStore<T>({value, update})
}

type MappingObject = {[key: string]: any}


class PropertyStore<T, K extends keyof T> implements DStore<T[K]> {
    constructor(private store: DStore<T>, private key: K) {}

    get value(): T[K] {
        return this.store.value[this.key]
    }

    async update(value: T[K]): Promise<void> {
        await this.store.update({
            ...this.store.value,
            [this.key]: value
        })
    }

    to<NewKey extends keyof T[K]>(key: NewKey): PropertyStore<T[K], NewKey> {
        return new PropertyStore(this, key)
    }
}


export function propertyStore<Parent extends MappingObject, Key extends keyof Parent>(parent: DStore<Parent>, key: Key): PropertyStore<Parent, Key> {
    return new PropertyStore(parent, key)
}

export function defaultValueStore<T>(parent: DStore<T | undefined> | DStore<T | null>, defaultValue: T): DStore<T> {
    return {
        get value() { return parent.value ?? defaultValue },
        update: value => parent.update(value)
    }
}

class MemoryStore<T> implements DStore<T> {
    constructor(private _value: T) {}

    get value() {
        return this._value
    }

    async update(newValue: T) {
        this._value = newValue
    }
}

export function memoryStore<T>(initialValue: T): MemoryStore<T> {
    return new MemoryStore(initialValue)
}

class ArrayStore<Item> implements DStore<Item[]> {
    constructor(private parent: DStore<Item[]>) {}

    get value() {
        return this.parent.value
    }

    async update(value: Item[]) {
        await this.parent.update(value)
    }

    get items(): ArrayItemStore<Item>[] {
        return this.parent.value.map((v, i) => new ArrayItemStore(this, i))
    }

    private async warpInternalUpdate(updater: (items: Item[]) => void) {
        const newArray = Array.from(this.parent.value)
        updater(newArray)
        await this.parent.update(newArray)
    }

    append(value: Item): Promise<void> {
        return this.warpInternalUpdate(items => {
            items.push(value)
        })
    }

    setItem(i: number, value: Item): Promise<void> {
        return this.warpInternalUpdate(items => {
            items[i] = value
        })
    }

    remove(i: number): Promise<void> {
        return this.warpInternalUpdate(items => {
            items.splice(i, 1)
        })
    }

    insert(i: number, value: Item): Promise<void> {
        return this.warpInternalUpdate(items => {
            items.splice(i, 0, value)
        })
    }

    move(fromIndex: number, toIndex: number): Promise<void> {
        return this.warpInternalUpdate(items => {
            items.splice(fromIndex, 1)
            items.splice(toIndex, toIndex <= fromIndex ? toIndex : toIndex-1)
        })
    }
}

class ArrayItemStore<Item> implements DStore<Item> {
    constructor(private parent: ArrayStore<Item>, private index: number) {}

    get value() {
        return this.parent.value[this.index]
    }

    async update(value: Item) {
        await this.parent.setItem(this.index, value)
    }

    async remove() {
        await this.parent.remove(this.index)
    }

    async move(toIndex: number) {
        await this.parent.move(this.index, toIndex)
    }
}

export function arrayStore<Item>(parent: DStore<Item[]>): ArrayStore<Item> {
    return new ArrayStore(parent)
}

class ValidateStore<T> implements DStore<T> {
    constructor(private parent: DStore<T>, private validator: (v: T) => boolean) {}
    get value() {
        return this.parent.value
    }
    async update(value: T) {
        if(this.validator(value)) {
            await this.parent.update(value)
        }
    }
}

export function validateStore<T>(parent: DStore<T>, validator: (v: T) => boolean): DStore<T> {
    return new ValidateStore(parent, validator)
}
