import {createContext} from "react"
import {ConfigProvider} from "antd"
import zhCN from "antd/locale/zh_CN"

const supportedLanguages = {
    zhCN,
} as const

export type SupportedLanguages = keyof typeof supportedLanguages

const InternationalContextInternal = createContext<SupportedLanguages>("zhCN")

export interface InternationalProviderProps {
    language: SupportedLanguages
    children: JSX.Element
}

export function InternationalProvider(props: InternationalProviderProps) {
    return <InternationalContextInternal.Provider value={props.language}>
        <ConfigProvider locale={supportedLanguages[props.language]}>
            {props.children}
        </ConfigProvider>
    </InternationalContextInternal.Provider>
}
