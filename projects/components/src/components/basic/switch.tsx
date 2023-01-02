import * as Antd from "antd"
import { DStore } from "../../store"

export interface SwitchProps {
    valueStore: DStore<boolean>
}

export function Switch({valueStore}: SwitchProps){
    return <Antd.Switch checked={valueStore.value} onChange={value => valueStore.update(value)}/>
}

export interface CheckboxProps {
    valueStore: DStore<boolean>
}

export function Checkbox({valueStore}: CheckboxProps) {
    return <Antd.Checkbox checked={valueStore.value} onChange={evt => valueStore.update(evt.target.checked)}/>
}
