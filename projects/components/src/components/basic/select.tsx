import {Select as AntdSelect} from "antd"
import { DBinding } from "../../store"

export interface SelectProps<T> {
    binding: DBinding<T>
    options: OptionItem<T>[]
}

export function Select<T>(props: SelectProps<T>) {
    return <AntdSelect
        defaultOpen={false}
        value={props.binding.value} 
        onChange={value => props.binding.update(value)} 
        options={props.options}
        >
        </AntdSelect>
}

function defaultSelectFilter<T>(input: string, value: T | undefined, label: React.ReactNode | undefined): boolean {
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
    binding: DBinding<T>
    placeholder: string
    optionFilter?: (input: string, value: T | undefined, label: React.ReactNode | undefined) => boolean
    options: OptionItem<T>[]
}

export function SelectWithFilter<T extends string | number>(props: SelectWithFilterProps<T>) {
    const optionFilter = props.optionFilter ?? defaultSelectFilter
    return <AntdSelect<T, {value: T, label: React.ReactNode}>
            value={props.binding.value}
            placeholder={props.placeholder}
            onChange={value => {
                props.binding.update(value)
            }}
            optionFilterProp="children"
            filterOption={(input, option) => optionFilter(input, option?.value, option?.label)}
            options={props.options}
        />
}
