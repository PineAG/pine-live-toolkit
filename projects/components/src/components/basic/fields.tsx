import { Form as AntdForm, Input, InputNumber, Button as AntdButton, notification, Tooltip } from "antd"
import { CopyOutlined as CopyIcon} from "@ant-design/icons"
import TextArea from "antd/es/input/TextArea"
import { DBinding } from "../../store"
import { HStack } from "./grid"

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
    return <AntdForm.Item label={props.label} style={{margin: 0}}>
        {props.children}
    </AntdForm.Item>
}

export interface CopyableInputProps {
    value: string
    successMessage: string
}

export function CopyableInput(props: CopyableInputProps){
    const [api, contextHolder] = notification.useNotification()
    async function onCopy(){
        const clipboard = navigator.clipboard
        if(!clipboard){
            api.error({message: "无法连接剪贴板"})
            return
        }
        try{
            clipboard.writeText(props.value)
            api.success({message: props.successMessage})
        }catch(e) {
            api.error({message: `写入剪贴板时出现问题`})
            throw e
        }
    }
    return <>
    <HStack layout={["1fr", "auto"]} spacing={5}>
        <Input value={props.value}/>
        <AntdButton
            icon={<CopyIcon/>}
            onClick={onCopy}
        />
    </HStack>
    {contextHolder}
    </>
}