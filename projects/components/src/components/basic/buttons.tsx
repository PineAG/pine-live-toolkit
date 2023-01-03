import {Button as AntdButton, Upload} from "antd"
import { UploadChangeParam, UploadFile } from "antd/es/upload"
import { useRef } from "react"
import { Icons } from "."

export interface ButtonProps {
    onClick?: () => void
    size?: "large" | "middle" | "small"
    icon?: JSX.Element
    children?: string | JSX.Element | JSX.Element[]
}

export function IconButton(props: ButtonProps) {
    return <AntdButton icon={props.icon} size={props.size} shape="circle" type="text" onClick={props.onClick}>{props.children}</AntdButton>
}

export function Button(props: ButtonProps) {
    return <AntdButton icon={props.icon} size={props.size} type="default" onClick={props.onClick}>{props.children}</AntdButton>
}

export function ActionButton(props: ButtonProps) {
    return <AntdButton icon={props.icon} size={props.size} type="primary" onClick={props.onClick}>{props.children}</AntdButton>
}

export function DangerButton(props: ButtonProps) {
    return <AntdButton icon={props.icon} size={props.size} type="primary" danger onClick={props.onClick}>{props.children}</AntdButton>
}

export interface UploadButtonProps {
    size?: "large" | "middle" | "small"
    icon?: JSX.Element
    children?: string | JSX.Element | JSX.Element[]
    multiple?: boolean
    acceptFiles?: string
    onChange: (input: FileList) => void
}

export function UploadButton(props: UploadButtonProps) {
    const ref = useRef<HTMLInputElement>()
    return <AntdButton icon={props.icon} size={props.size} onClick={() => ref.current?.click()}>
        {props.children}
        <input
            ref={ref}
            type="file"
            style={{display: "none"}}
            accept={props.acceptFiles}
            multiple={props.multiple}
            onChange={evt => {
                props.onChange(evt.target.files)
            }}  
        />
    </AntdButton>
}
