import {useState, useEffect} from "react"
import { DBinding, haltBinding, Loading, useLocalDBinding } from "@pltk/components"
import { AsyncBindingResult, AsyncSubscriptionResult } from "../backend";

export function unwrapAsyncSubs<T, R>(subs: AsyncSubscriptionResult<T>, renderer: (value: T) => R): JSX.Element | R {
    if(subs.status === "pending") {
        return <Loading/>
    } else {
        return renderer(subs.value)
    }
}

export function unwrapAsyncBinding<T, R>(subs: AsyncBindingResult<T>, renderer: (binding: DBinding<T>) => R): JSX.Element | R {
    if(subs.status === "pending") {
        return <Loading/>
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
