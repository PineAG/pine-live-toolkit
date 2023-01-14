import {AsyncBindingResult, AsyncSubscriptionResult} from "@pltk/components"
import { IDisposable, SubscriptionCallback } from "@pltk/protocol"
import { useEffect, useState } from "react"

export interface UseAsyncSubscriptionOptions<T> {
    fetch(): Promise<T>
    subscription: (callback: SubscriptionCallback) => IDisposable
    dependencies: any[]
}

export function useAsyncSubscription<T>(options: UseAsyncSubscriptionOptions<T>): AsyncSubscriptionResult<T> {
    const [value, setValue] = useState<T | null>(null)
    async function update() {
        const value = await options.fetch()
        setValue(value)
    }
    useEffect(() => {
        update()
        const disposable = options.subscription(() => update())
        return () => disposable.close()
    }, options.dependencies)
    if(value === null) {
        return {status: "pending"}
    } else {
        return {status: "success", value}
    }
}

export interface UseAsyncBindingOptions<T> {
    fetch(): Promise<T>
    update(value: T): Promise<void>
    subscription: (callback: SubscriptionCallback) => IDisposable
    dependencies: any[]
}

export function useAsyncBinding<T>(options: UseAsyncBindingOptions<T>): AsyncBindingResult<T> {
    const subs = useAsyncSubscription(options)
    if(subs.status === "success") {
        return {
            status: "success",
            binding: {
                value: subs.value,
                update: v => options.update(v)
            }
        }
    } else {
        return subs
    }
}