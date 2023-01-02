import {Select as AntdSelect} from "antd"
import { DStore } from "../../store"

export interface SelectProps {
    valueStore: DStore<string>
    options: OptionItem<string>[]
}

export function Select<T>(props: SelectProps) {
    return <AntdSelect
        defaultOpen={false}
        defaultValue=""
        value={props.valueStore.value} 
        onChange={value => props.valueStore.update(value)} 
        options={props.options}
        >
        </AntdSelect>
}

function defaultSelectFilter<T>(input: string, value: T | undefined, label: React.ReactNode | undefined): boolean {
    return true
    const inputText = input?.toString().toLowerCase() ?? ""
    const valueText = value?.toString().toLowerCase() ?? ""
    const labelText = label?.toString().toLowerCase() ?? ""
    return valueText.includes(inputText) || labelText.includes(inputText)
}

interface OptionItem<T> {
    label: string | JSX.Element
    value: T
}

export interface SelectWithFilterProps<T> {
    valueStore: DStore<T>
    placeholder: string
    optionFilter?: (input: string, value: T | undefined, label: React.ReactNode | undefined) => boolean
    options: OptionItem<T>[]
}

export function SelectWithFilter<T extends string | number>(props: SelectWithFilterProps<T>) {
    const optionFilter = props.optionFilter ?? defaultSelectFilter
    return <AntdSelect<T, {value: T, label: React.ReactNode}>
            value={props.valueStore.value}
            placeholder={props.placeholder}
            onChange={value => {
                props.valueStore.update(value)
            }}
            optionFilterProp="children"
            filterOption={(input, option) => optionFilter(input, option?.value, option?.label)}
            options={props.options}
        />
}
