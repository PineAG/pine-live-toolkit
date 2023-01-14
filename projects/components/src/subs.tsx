import { useEffect, useState } from "react"
import { Loading } from "./components"
import { DBinding, useLocalDBinding } from "./store"

export type AsyncSubscriptionResult<T> = {status: "pending"} | {status: "success", value: T}
export type AsyncBindingResult<T> = {status: "pending"} | {status: "success", binding: DBinding<T>}

export interface UnwrapAsyncOptions {
    pendingElement: React.ReactNode
}

export function unwrapAsyncSubs<T, R>(subs: AsyncSubscriptionResult<T>, renderer: (value: T) => R, options?: Partial<UnwrapAsyncOptions>): JSX.Element | R {
    if(subs.status === "pending") {
        return <>{
            options?.pendingElement ?? <Loading/>
        }</>
    } else {
        return renderer(subs.value)
    }
}

export function unwrapAsyncBinding<T, R>(subs: AsyncBindingResult<T>, renderer: (binding: DBinding<T>) => R, options?: Partial<UnwrapAsyncOptions>): JSX.Element | R {
    if(subs.status === "pending") {
        return <>{
            options?.pendingElement ?? <Loading/>
        }</>
    } else {
        return renderer(subs.binding)
    }
}

export function useAsyncTemporaryBinding<T>(bind: AsyncBindingResult<T>): [AsyncBindingResult<T>, () => Promise<void>, boolean] {
    const tmpBinding = useLocalDBinding<T | undefined>(bind.status === "success" ? bind.binding.value : undefined)
    const [dirty, setDirty] = useState(false)
    useEffect(() => {
        if(bind.status === "success") {
            tmpBinding.update(bind.binding.value)
            setDirty(false)
        }
    }, [bind.status === "success" ? bind.binding.value : undefined])
    if(bind.status === "success") {
        if(tmpBinding.value === undefined) {
            return [{status: "pending"}, () => {throw new Error("Operation not allowed")}, false]
        }else{
            return [{status: "success", binding: {
                value: tmpBinding.value,
                update: async (value) => {
                    await tmpBinding.update(value)
                    setDirty(true)
                }
            }}, () => bind.binding.update(tmpBinding.value as T), dirty]
        }
    } else {
        return [bind, () => Promise.resolve(), false]
    }
}
