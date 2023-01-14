import { useEffect, useState } from "react"
import { Loading } from "./components"
import { DBinding, haltBinding, useLocalDBinding } from "./store"

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

export function useAsyncTemporaryBinding<T>(bind: AsyncBindingResult<T>): AsyncSubscriptionResult<[DBinding<T>, () => Promise<void>, boolean]> {
    const [tmpBind, setTmpBind] = useState<AsyncBindingResult<T>>({status: "pending"})
    const [dirty, setDirty] = useState(false)
    useEffect(() => {
        if(bind.status === "success") {
            const update = async (value: T) => {
                setTmpBind({
                    status: "success",
                    binding: {
                        value,
                        update 
                    }
                })
                setDirty(true)
            }
            setTmpBind({
                status: "success",
                binding: {
                    value: bind.binding.value,
                    update
                }
            })
        } else {
            setTmpBind(bind)
        }
    }, [bind.status === "success" ? bind.binding.value : undefined])
    if(bind.status === "success") {
        const saver = async () => {
            await bind.binding.update(bind.binding.value)
        }
        if(tmpBind.status === "success") {
            return {
                status: "success",
                value: [tmpBind.binding, saver, dirty]
            }
        }else{
            return tmpBind
        }
    } else {
        return bind
    }
}
