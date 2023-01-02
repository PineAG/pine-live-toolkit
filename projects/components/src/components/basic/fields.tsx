import {Input, InputNumber, Form as AntdForm} from "antd"
import TextArea from "antd/es/input/TextArea"
import { DBinding } from "../../store"

export interface FieldBaseProps {
    placeholder?: string
    icon?: JSX.Element
}

export interface StringFieldProps extends FieldBaseProps {
    binding: DBinding<string>
    maxLength?: number
    prefix?: string | JSX.Element
    suffix?: string | JSX.Element
}

export function StringField(props: StringFieldProps) {
    return <Input
        value={props.binding.value ?? ""}
        onChange={evt => props.binding.update(evt.target.value ?? "")}
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
        value={props.binding.value}
        onChange={evt => props.binding.update(evt.target.value ?? "")}
        placeholder={props.placeholder}
        rows={props.rows}
    />
}

export interface NumberFieldProps extends FieldBaseProps {
    binding: DBinding<number>
    min?: number
    max?: number
    step?: number
    prefix?: string | JSX.Element
}

export function NumberField(props: NumberFieldProps) {
    return <InputNumber
        value={props.binding.value}
        onChange={newValue => props.binding.update(newValue ?? 0)}
        placeholder={props.placeholder}
        prefix={props.prefix}
        min={props.min}
        max={props.max}
        step={props.step}
    />
}

export interface FormProps {
    children: JSX.Element | JSX.Element[]
}

export function InlineForm(props: FormProps) {
    return <AntdForm layout="inline">
        {props.children}
    </AntdForm>
}

export interface FormItemProps {
    label: string
    children: JSX.Element
}

export function FormItem(props: FormItemProps) {
    return <AntdForm.Item label={props.label}>
        {props.children}
    </AntdForm.Item>
}
