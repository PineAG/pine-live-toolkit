import { Modal, Popconfirm, Tooltip as AntdTooltip, notification } from "antd"
import { useEffect } from "react"
import { DBinding } from "../../store"

export interface DialogProps {
    title: string
    open: boolean
    onOk: () => void
    onCancel: () => void
    children: JSX.Element | JSX.Element[]
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
    children: JSX.Element | JSX.Element[]
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
    icon?: JSX.Element
}

export function Notification(props: NotificationProps) {
    const [api, contextHolder] = notification.useNotification()
    useEffect(() => {
        if(props.binding.value) {
            api.open({
                message: props.title,
                description: props.content,
                icon: props.icon,
                onClose: () => {
                    props.binding.update(false)
                }
            })
        }
    }, [props.binding.value])
    return <>
        {contextHolder}
    </>
}
