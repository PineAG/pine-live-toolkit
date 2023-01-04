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

export type APIBindingState<T> = {
    status: "Pending"
} | {
    status: "Success",
    binding: DBinding<T | null>
} | {
    status: "Failed",
    message?: any
}

type UseAPIBindingState<T> = {
    status: "Pending"
} | {
    status: "Success",
    value: T | null
} | {
    status: "Failed",
    message?: any
}

export function useAPIBinding<T>(client: IDataClient<T>): APIBindingState<T> {
    const [state, setState] = useState<UseAPIBindingState<T>>({status: "Pending"})
    useEffect(() => {
        setState({status: "Pending"})
        const disposer = client.onValueChanged(value => {
            setState({status: "Success", value})
        })
        client.get().then(value => setState({status: "Success", value}))
        return () => disposer.close()
    }, [client])
    if(state.status === "Success") {
        return {
            status: "Success",
            binding: {
                value: state.value,
                update: async (newValue) => {
                    if(newValue === null) {
                        client.delete()
                    } else {
                        client.set(newValue)
                    }
                }
            }
        }
    } else {
        return state
    }
}
