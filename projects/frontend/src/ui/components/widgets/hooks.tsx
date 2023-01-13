import { DBinding } from "@pltk/components";
import { Rect } from "@pltk/protocol";
import { useWidgetConfigBinding, useWidgetRectBinding } from "../../backend";
import { createNullableContext, useNullableContext } from "../../backend/hooks/utils";
import { unwrapAsyncBinding } from "../subs";

export interface IWidgetBackendContext<Config> {
    config: DBinding<Config>
    rect: DBinding<Rect>
}

export interface IWidgetDefinitionContext<Config> {
    config: DBinding<Config>
    backend: null | IWidgetBackendContext<Config>
}

const WidgetDefinitionContextContext = createNullableContext<IWidgetDefinitionContext<any>>("Widget definition not initialized.")

export function useWidgetDefinitionContext<Config>(): IWidgetDefinitionContext<Config> {
    return useNullableContext(WidgetDefinitionContextContext)
}

export interface PreviewWidgetContextProviderProps {
    children: any
}

export function PreviewWidgetContextProvider(props: PreviewWidgetContextProviderProps) {
    const rectReq = useWidgetRectBinding()
    const configReq = useWidgetConfigBinding()
    return unwrapAsyncBinding(rectReq, rectBinding => {
        return unwrapAsyncBinding(configReq, configBinding => {
            const ctx: IWidgetDefinitionContext<any> = {
                config: {
                    value: configBinding.value,
                    update: async config => {}
                },
                backend: {
                    config: configBinding,
                    rect: rectBinding
                }
            }
            return <WidgetDefinitionContextContext.Provider value={ctx}>
                {props.children}
            </WidgetDefinitionContextContext.Provider>
        })
    })
}

export interface EditableWidgetContextProviderProps<C> {
    tempConfig: DBinding<C | null>
    children: any
}

export function EditableWidgetContextProvider(props: EditableWidgetContextProviderProps<any>) {
    const rectReq = useWidgetRectBinding()
    const configReq = useWidgetConfigBinding()
    return unwrapAsyncBinding(rectReq, rectBinding => {
        return unwrapAsyncBinding(configReq, configBinding => {
            const ctx: IWidgetDefinitionContext<any> = {
                config: props.tempConfig,
                backend: {
                    config: configBinding,
                    rect: rectBinding
                }
            }
            return <WidgetDefinitionContextContext.Provider value={ctx}>
                {props.children}
            </WidgetDefinitionContextContext.Provider>
        })
    })
}

export interface NewWidgetContextProviderProps<C> {
    tmpConfig: DBinding<C>
    children: any
}

export function NewWidgetContextProvider(props: NewWidgetContextProviderProps<any>) {
    return <WidgetDefinitionContextContext.Provider value={{config: props.tmpConfig, backend: null}}>
        {props.children}
    </WidgetDefinitionContextContext.Provider>
}
