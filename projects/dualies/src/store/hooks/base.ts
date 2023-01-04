import DualiesClient from "@dualies/client"
import { DBinding } from "@dualies/components"
import { createContext, useContext, useEffect, useState } from "react"
import { APIWrapper, IBackend, IDataClient, IFileClient } from "../client"

const BackendContext = createContext<IBackend>(new DualiesClient({path: "/api"}))

export const BackendProvider = BackendContext.Provider

export function useBackend(): IBackend {
    return useContext(BackendContext)
}

export function useAPIWrapper(): APIWrapper {
    const backend = useBackend()
    return new APIWrapper(backend)
}

export function useFileClient(): IFileClient {
    return useContext(BackendContext).files()
}

export type AsyncBindingState<T> = {
    status: "Pending"
} | {
    status: "Success",
    binding: DBinding<T>
} | {
    status: "Failed",
    message?: any
}

type UseAsyncBindingState<T> = {
    status: "Pending"
} | {
    status: "Success",
    value: T
} | {
    status: "Failed",
    message?: any
}

export function useAsyncBinding<T>(get: () => Promise<T>, update: (value: T) => Promise<void>): AsyncBindingState<T> {
    const [state, setState] = useState<UseAsyncBindingState<T>>({status: "Pending"})
    useEffect(() => {
        setState({status: "Pending"})
        get().then(value => {
            setState({status: "Success", value})
        }).catch(err => {
            setState({status: "Failed", message: err})
        })
    }, [get, update])
    if(state.status === "Success") {
        return {
            status: "Success",
            binding: {
                value: state.value,
                update
            }
        }
    } else {
        return state
    }
}

