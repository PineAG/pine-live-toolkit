import {useState} from "react"

export interface DBinding<T> {
    value: T
    update: (value: T) => Promise<void>
}

interface CreateDBindingProps<T> {
    value: T
    update: (value: T) => void | Promise<void>
}

export function createDBinding<T>({value, update}: CreateDBindingProps<T>) : DBinding<T> {
    return {
        value, 
        update: async v => update(v),
    }
}

export function createReadonlyDBinding<T>(value: T) : DBinding<T> {
    return createDBinding({value, update: () => {}})
}

export function useLocalDBinding<T>(defaultValue: T): DBinding<T> {
    const [value, update] = useState(defaultValue)
    return createDBinding<T>({value, update})
}

type MappingObject = {[key: string]: any}


class PropertyBinding<T, K extends keyof T> implements DBinding<T[K]> {
    constructor(private store: DBinding<T>, private key: K) {}

    get value(): T[K] {
        return this.store.value[this.key]
    }

    async update(value: T[K]): Promise<void> {
        await this.store.update({
            ...this.store.value,
            [this.key]: value
        })
    }

    to<NewKey extends keyof T[K]>(key: NewKey): PropertyBinding<T[K], NewKey> {
        return new PropertyBinding(this, key)
    }
}


export function propertyBinding<Parent extends MappingObject, Key extends keyof Parent>(parent: DBinding<Parent>, key: Key): PropertyBinding<Parent, Key> {
    return new PropertyBinding(parent, key)
}

export function defaultValueBinding<T>(parent: DBinding<T | undefined> | DBinding<T | null>, defaultValue: T): DBinding<T> {
    return {
        get value() { return parent.value ?? defaultValue },
        update: value => parent.update(value)
    }
}

class MemoryBinding<T> implements DBinding<T> {
    constructor(private _value: T) {}

    get value() {
        return this._value
    }

    async update(newValue: T) {
        this._value = newValue
    }
}

export function memoryBinding<T>(initialValue: T): MemoryBinding<T> {
    return new MemoryBinding(initialValue)
}

class ArrayBinding<Item> implements DBinding<Item[]> {
    constructor(private parent: DBinding<Item[]>) {}

    get value() {
        return this.parent.value
    }

    async update(value: Item[]) {
        await this.parent.update(value)
    }

    get items(): ArrayItemBinding<Item>[] {
        return this.parent.value.map((v, i) => new ArrayItemBinding(this, i))
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

class ArrayItemBinding<Item> implements DBinding<Item> {
    constructor(private parent: ArrayBinding<Item>, private index: number) {}

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

export function arrayBinding<Item>(parent: DBinding<Item[]>): ArrayBinding<Item> {
    return new ArrayBinding(parent)
}

class ValidateBinding<T> implements DBinding<T> {
    constructor(private parent: DBinding<T>, private validator: (v: T) => boolean) {}
    get value() {
        return this.parent.value
    }
    async update(value: T) {
        if(this.validator(value)) {
            await this.parent.update(value)
        }
    }
}

export function validateBinding<T>(parent: DBinding<T>, validator: (v: T) => boolean): DBinding<T> {
    return new ValidateBinding(parent, validator)
}

interface MapBindingProps<T, R> {
    forward: (value: T) => R
    backward: (value: R, parent: T) => T
}

export function mapBinding<T, R>(parent: DBinding<T>, props: MapBindingProps<T, R>): DBinding<R> {
    return {
        get value() { return props.forward(parent.value) },
        update: value => parent.update(props.backward(value, parent.value))
    }
}