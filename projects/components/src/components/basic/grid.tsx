import {Row, Col} from "antd"

type GridChildren = JSX.Element | string | null | GridChildren[]

interface GridPropsBase {
    style?: React.CSSProperties
    className?: string
    children: GridChildren
}

export interface GridContainerProps extends GridPropsBase {
    container: true
    item?: false
    spacing?: number
}

export interface GridItemProps extends GridPropsBase{
    container?: false
    span: number
}

export interface GridItemContainerProps extends GridPropsBase{
    container: true
    spacing?: number
    span: number
}

export function Grid(props: GridContainerProps | GridItemProps | GridItemContainerProps) {
    const elementProps = {style: props.style, className: props.className}
    if(props.container && "span" in props) {
        const spacing = props.spacing ?? 22
        return <Col {...elementProps} span={props.span * 2}>
            <Row gutter={[spacing, spacing]} justify="space-around">
                {props.children}
            </Row>
        </Col>
    } else if (props.container) {
        const spacing = props.spacing ?? 22
        return <Row {...elementProps} gutter={[spacing, spacing]}  justify="space-around">
            {props.children}
        </Row>
    } else if ("span" in props){
        return <Col {...elementProps} span={props.span * 2}>
            {props.children}
        </Col>
    } else {
        throw new Error(`Invalid props: container=${props["container"] ?? false}, item=${props["item"] ?? false}`)
    }
}
