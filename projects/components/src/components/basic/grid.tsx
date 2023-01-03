import {Row, Col} from "antd"
import { createContext, useContext } from "react"

type GridChildren = JSX.Element | string | null | GridChildren[]

const gridAlignmentMapping = {
    left: "start",
    right: "end",
    evenly: "space-around"
} as const

type GridAlignment = keyof typeof gridAlignmentMapping

interface GridPropsBase {
    style?: React.CSSProperties
    className?: string
    children: GridChildren
}

export interface GridContainerProps extends GridPropsBase {
    container: true
    item?: false
    spacing?: number
    alignment?: GridAlignment
}

export interface GridItemProps extends GridPropsBase{
    container?: false
    span: number
}

export interface GridItemContainerProps extends GridPropsBase{
    container: true
    spacing?: number
    span: number
    alignment?: GridAlignment
}

const GridAlignmentContext = createContext<GridAlignment>("evenly")

export function Grid(props: GridContainerProps | GridItemProps | GridItemContainerProps) {
    let alignment = useContext(GridAlignmentContext)
    if("alignment" in props && props.alignment !== undefined) {
        alignment = props.alignment
    }
    const elementProps = {style: props.style, className: props.className}
    if(props.container && "span" in props) {
        const spacing = props.spacing ?? 22
        return <GridAlignmentContext.Provider value={alignment}>
            <Col {...elementProps} span={props.span * 2}>
                <Row gutter={[spacing, spacing]} justify={gridAlignmentMapping[alignment]}>
                    {props.children}
                </Row>
            </Col>
        </GridAlignmentContext.Provider>
    } else if (props.container) {
        const spacing = props.spacing ?? 22
        return <GridAlignmentContext.Provider value={alignment}>
            <Row {...elementProps} gutter={[spacing, spacing]}  justify={gridAlignmentMapping[alignment]}>
                {props.children}
            </Row>
        </GridAlignmentContext.Provider>
    } else if ("span" in props){
        return <GridAlignmentContext.Provider value={alignment}>
            <Col {...elementProps} span={props.span * 2}>
                {props.children}
            </Col>
        </GridAlignmentContext.Provider>
    } else {
        throw new Error(`Invalid props: container=${props["container"] ?? false}, item=${props["item"] ?? false}`)
    }
}
