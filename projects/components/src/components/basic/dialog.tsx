import { Modal, Popconfirm } from "antd"

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