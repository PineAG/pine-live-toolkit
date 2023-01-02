import * as Antd from "antd"
import { DBinding } from "../../store"
import { ButtonProps, IconButton } from "./buttons"

export interface SwitchProps {
    binding: DBinding<boolean>
}

export function Switch({binding}: SwitchProps){
    return <Antd.Switch checked={binding.value} onChange={value => binding.update(value)}/>
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
}

export function IconSwitch(props: IconSwitchProps) {
    const icon = props.binding.value ? props.enabledIcon : props.disabledIcon
    return <IconButton
        size={props.size}
        icon={icon}
        onClick={() => props.binding.update(!props.binding.value)}
    />
}