import { DBinding, Loading } from "@pltk/components"
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
