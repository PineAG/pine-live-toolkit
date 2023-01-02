import {Row, Col} from "antd"

export interface GridContainerProps {
    container: true
    spacing?: number
    children: JSX.Element
}

export interface GridItemProps{
    container?: false
    span: number
    children: JSX.Element
}

function isGridContainerProps(props: GridContainerProps | GridItemProps): props is GridContainerProps {
    return props.container
}

function isGridItemProps(props: GridContainerProps | GridItemProps): props is GridItemProps {
    return !props.container
}

export function Grid(props: GridContainerProps | GridItemProps) {
    if(isGridContainerProps(props)) {
        return <Row gutter={props.spacing}>
            {props.children}
        </Row>
    } else if (isGridItemProps(props)) {
        return <Col span={props.span * 2}>
            {props.children}
        </Col>
    } else {
        throw new Error(props)
    }
}
