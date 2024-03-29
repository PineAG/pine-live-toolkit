import * as Antd from "antd"
import { CSSProperties } from "react"
import { DBinding } from "../../store"
import { ButtonProps, IconButton } from "./buttons"

export interface SwitchProps {
    binding: DBinding<boolean>
    disabled?: boolean
}

export function Switch({binding, disabled}: SwitchProps){
    return <Antd.Switch disabled={disabled} checked={binding.value} onClick={value => binding.update(value)}/>
}

export interface CheckboxProps {
    binding: DBinding<boolean>
}

export function Checkbox({binding}: CheckboxProps) {
    return <Antd.Checkbox checked={binding.value} onChange={evt => binding.update(evt.target.checked)}/>
}

export interface IconSwitchProps {
    enabledIcon: JSX.Element
    disabledIcon: JSX.Element
    binding: DBinding<boolean>
    size?: ButtonProps["size"]
    style?: CSSProperties
}

export function IconSwitch(props: IconSwitchProps) {
    const icon = props.binding.value ? props.enabledIcon : props.disabledIcon
    return <IconButton
        size={props.size}
        icon={icon}
        onClick={() => props.binding.update(!props.binding.value)}
        style={props.style}
    />
}