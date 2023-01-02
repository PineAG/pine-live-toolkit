import {Row, Col} from "antd"

type GridChild = JSX.Element | string | null
type GridChildren = GridChild | GridChild[]

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
    item?: true
    span: number
}

export interface GridItemContainerProps extends GridPropsBase{
    container: true
    item: true
    spacing?: number
    span: number
}

function isItemProps(props: GridContainerProps | GridItemProps | GridItemContainerProps): props is GridItemProps {
    return (props.item === undefined || props.item) && !props.container
}


export function Grid(props: GridContainerProps | GridItemProps | GridItemContainerProps) {
    const elementProps = {style: props.style, className: props.className}
    if(props.container && props.item) {
        return <Col {...elementProps} span={props.span}>
            <Row gutter={props.spacing}>
                {props.children}
            </Row>
        </Col>
    } else if (props.container) {
        return <Row {...elementProps} gutter={props.spacing}>
            {props.children}
        </Row>
    } else if (isItemProps(props)){
        return <Col {...elementProps} span={props.span * 2}>
            {props.children}
        </Col>
    } else {
        throw new Error(`Invalid props: container=${props["container"] ?? false}, item=${props["item"] ?? false}`)
    }
}
