import {Input, InputNumber} from "antd"
import TextArea from "antd/es/input/TextArea"
import { DStore } from "../store"

export interface FieldBaseProps {
    placeholder?: string
    icon?: JSX.Element
}

export interface StringFieldProps extends FieldBaseProps {
    valueStore: DStore<string>
    maxLength?: number
    prefix?: JSX.Element
    suffix?: JSX.Element
}

export function StringField(props: StringFieldProps) {
    return <Input
        value={props.valueStore.value}
        onChange={evt => props.valueStore.update(evt.target.value)}
        placeholder={props.placeholder}
        prefix={props.prefix}
        suffix={props.suffix}
    />
}

export interface MultiLinesStringFieldProps extends Omit<StringFieldProps, "prefix" | "suffix"> {
    rows?: number
}

export function MultiLinesStringField(props: MultiLinesStringFieldProps) {
    return <TextArea
        value={props.valueStore.value}
        onChange={evt => props.valueStore.update(evt.target.value)}
        placeholder={props.placeholder}
        rows={props.rows}
    />
}

export interface NumberFieldProps extends FieldBaseProps {
    valueStore: DStore<number>
    min?: number
    max?: number
    step?: number
    prefix?: JSX.Element
}

export function NumberField(props: NumberFieldProps) {
    return <InputNumber
        value={props.valueStore.value}
        onChange={props.valueStore.update}
        placeholder={props.placeholder}
        prefix={props.prefix}
        min={props.min}
        max={props.max}
        step={props.step}
    />
}
