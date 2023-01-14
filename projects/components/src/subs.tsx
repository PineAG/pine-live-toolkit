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
