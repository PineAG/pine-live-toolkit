import { createContext, useContext } from "react"

type NullableWrapper<T> = {initialized: false, message: string} | {initialized: true, value: T}
export interface NullableContextProviderProps<T> {
    value: T
    children: any
}
export interface NullableContext<T> {
    context: React.Context<NullableWrapper<T>>
    Provider: React.FC<NullableContextProviderProps<T>>
}

export function createNullableContext<T>(message: string): NullableContext<T> {
    const context = createContext<NullableWrapper<T>>({initialized: false, message})
    return {
        context,
        Provider: props => (
            <context.Provider value={{initialized: true, value: props.value}}>
                {props.children}
            </context.Provider>
        )
    }
}

export function useNullableContext<T>(context: NullableContext<T>): T {
    const internal = useContext(context.context)
    if(internal.initialized) {
        return internal.value
    } else {
        throw new Error(internal.message)
    }
}