import * as Antd from "antd"
import { DBinding } from "../../store"

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
