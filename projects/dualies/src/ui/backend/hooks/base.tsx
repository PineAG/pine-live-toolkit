import { DBinding } from "@pltk/components"
import { createContext, useContext, useEffect, useState } from "react"
import { defaultFileClient, defaultGlobalBackend, IGlobalBackend } from "../base"
import { IFileClient } from "../client"

const BackendAPIContext = createContext<IGlobalBackend>(defaultGlobalBackend)
const FileClientContext = createContext<IFileClient>(defaultFileClient)

export interface BackendConfig {
    backend: IGlobalBackend
    fileClient: IFileClient
}

interface BackendProviderProps extends BackendConfig {
    children: any
}

export function BackendProvider(props: BackendProviderProps) {
    return <BackendAPIContext.Provider value={props.backend}>
        <FileClientContext.Provider value={props.fileClient}>
            {props.children}
        </FileClientContext.Provider>
    </BackendAPIContext.Provider>
} 

export function useBackend(): IGlobalBackend {
    return useContext(BackendAPIContext)
}

export function useFileClient(): IFileClient {
    return useContext(FileClientContext)
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

