import {Button as AntdButton} from "antd"
import { CSSProperties, useRef } from "react"

export interface ButtonProps {
    onClick?: () => void
    size?: "large" | "middle" | "small"
    icon?: JSX.Element
    children?: string | JSX.Element | JSX.Element[]
    style?: CSSProperties
}

export function IconButton(props: ButtonProps) {
    return <AntdButton icon={props.icon} size={props.size} shape="circle" type="text" onClick={props.onClick} style={props.style}>{props.children}</AntdButton>
}

export function Button(props: ButtonProps) {
    return <AntdButton icon={props.icon} size={props.size} type="default" onClick={props.onClick} style={props.style}>{props.children}</AntdButton>
}

export function ActionButton(props: ButtonProps) {
    return <AntdButton icon={props.icon} size={props.size} type="primary" onClick={props.onClick} style={props.style}>{props.children}</AntdButton>
}

export function DangerButton(props: ButtonProps) {
    return <AntdButton icon={props.icon} size={props.size} type="primary" danger onClick={props.onClick} style={props.style}>{props.children}</AntdButton>
}

export interface UploadButtonProps {
    size?: "large" | "middle" | "small"
    icon?: JSX.Element
    children?: string | JSX.Element | JSX.Element[]
    multiple?: boolean
    acceptFiles?: string
    onChange: (input: FileList | null) => void
    style?: CSSProperties
}

export function UploadButton(props: UploadButtonProps) {
    const ref = useRef<HTMLInputElement>(null)
    return <AntdButton icon={props.icon} size={props.size} onClick={() => ref.current?.click()} style={props.style}>
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
