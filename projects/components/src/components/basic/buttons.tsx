import {Button as AntdButton} from "antd"
import { ComponentProps, CSSProperties, useRef } from "react"

export interface ButtonProps {
    onClick?: () => void
    size?: "large" | "middle" | "small"
    icon?: JSX.Element
    children?: string | JSX.Element | JSX.Element[]
    style?: CSSProperties
    disabled?: boolean
}

function buttonPropsToAntdProps(props: ButtonProps): ComponentProps<typeof AntdButton> {
    return {
        icon: props.icon,
        disabled: props.disabled,
        style: props.style,
        onClick: props.onClick,
        size: props.size
    }
}

export function IconButton(props: ButtonProps) {
    return <AntdButton shape="circle" type="text" {...buttonPropsToAntdProps(props)}>{props.children}</AntdButton>
}

export function Button(props: ButtonProps) {
    return <AntdButton type="default" {...buttonPropsToAntdProps(props)}>{props.children}</AntdButton>
}

export function ActionButton(props: ButtonProps) {
    return <AntdButton type="primary" {...buttonPropsToAntdProps(props)}>{props.children}</AntdButton>
}

export function DangerButton(props: ButtonProps) {
    return <AntdButton type="primary" danger {...buttonPropsToAntdProps(props)}>{props.children}</AntdButton>
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
