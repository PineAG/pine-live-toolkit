import { Button as AntdButton, Modal, notification, Popconfirm, Popover as AntdPopover, Tooltip as AntdTooltip } from "antd"
import { useEffect } from "react"
import { CompactPicker } from "react-color"
import { DBinding } from "../../store"
import { NodeChildren } from "./utils"

export interface DialogProps {
    title: string
    open: boolean
    onOk: () => void
    onCancel: () => void
    children: NodeChildren
}

export function Dialog(props: DialogProps) {
    return <Modal
        title={props.title}
        open={props.open}
        onOk={props.onOk}
        onCancel={props.onCancel}
        width="50%"
    >
        {props.children}
    </Modal>
}

export interface QuickConfirmProps {
    title: string
    description: string
    onConfirm: () => void
    children: NodeChildren
}

export function QuickConfirm(props: QuickConfirmProps) {
    return <Popconfirm
        title={props.title}
        description={props.description}
        onConfirm={props.onConfirm}
    >
        {props.children}
    </Popconfirm>
}

export interface TooltipProps {
    title: string
    children: JSX.Element | string
}

export function Tooltip(props: TooltipProps) {
    return <AntdTooltip title={props.title}>
        {props.children}
    </AntdTooltip>
}

export interface NotificationProps {
    binding: DBinding<boolean>
    title: string
    content?: string | JSX.Element | JSX.Element[] | null
    icon?: JSX.Element,
    type?: "success" | "info" | "error" | "warning"
}

export function Notification(props: NotificationProps) {
    const [api, contextHolder] = notification.useNotification()
    useEffect(() => {
        if(props.binding.value) {
            api.open({
                message: props.title,
                description: props.content,
                icon: props.icon,
                type: props.type,
                onClose: () => {
                    props.binding.update(false)
                }
            })
        }
    }, [props.binding.value, props.title, props.content, props.type])
    return <>
        {contextHolder}
    </>
}

export interface ColorPickerProps {
    binding: DBinding<string>
    block?: boolean
}

export function ColorPicker(props: ColorPickerProps) {
    const content = <CompactPicker color={props.binding.value} onChange={res => props.binding.update(res.hex)}/>
    return <AntdPopover title="选择颜色" content={content} trigger="click">
        <AntdButton type="default" style={{backgroundColor: props.binding.value, boxShadow: "inset 0px 0px 3px #888"}}>

        </AntdButton>
    </AntdPopover>
}
