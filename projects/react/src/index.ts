import {useState, useEffect} from "react"
import DualiesClient, { JsonDataClient } from "@dualies/client";

type DualiesDataState<T> = {pending: true, value: undefined} | {pending: false, value: T | null}

export interface DualiesManager<T> {
    state: DualiesDataState<T>
    client: JsonDataClient<T>
}

export function useDualiesData<T>(dualiesClient: DualiesClient, path: string, defaultValue: () => T): DualiesManager<T> {
    const client = dualiesClient.data<T>(path)
    const [state, setState] = useState<DualiesDataState<T>>({pending: true, value: undefined})
    useEffect(() => {
        const manager = client.onValueChanged(val => {
            setState({
                pending: false,
                value: val ?? defaultValue()
            })
        })
        return () => manager.close()
    }, [dualiesClient, path])
    return {
        state,
        client
    }
}
