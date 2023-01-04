import { Collapse as AntCollapse } from "antd"

export interface CollapseProps {
    title: string | JSX.Element
    children: JSX.Element | JSX.Element[]
}

export function Collapse(props: CollapseProps) {
    return <AntCollapse ghost>
        <AntCollapse.Panel header={props.title} key="1">
            {props.children}
        </AntCollapse.Panel>
    </AntCollapse>
}
