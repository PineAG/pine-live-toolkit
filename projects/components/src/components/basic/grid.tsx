import { Col, Row } from "antd"
import { createContext, CSSProperties, useContext } from "react"
import { NodeChildren } from "./utils"

const gridAlignmentMapping = {
    left: "start",
    right: "end",
    evenly: "space-around"
} as const

type GridAlignment = keyof typeof gridAlignmentMapping

interface GridPropsBase {
    style?: React.CSSProperties
    className?: string
    children: NodeChildren
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

const GridAlignmentContext = createContext<GridAlignment>("left")

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

const flexDirectionMapping = {
    horizontal: "row",
    vertical: "column"
} as const

const flexAlignmentMapping = {
    start: "flex-start",
    end: "flex-end",
    center: "flex-center",
    evenly: "space-around",
    "space-between": "space-between"
} as const

export interface FlexProps {
    direction?: keyof typeof flexDirectionMapping
    reverse?: boolean
    children: NodeChildren
    spacing?: number
    alignment?: keyof typeof flexAlignmentMapping
    nowrap?: boolean
    style?: React.CSSProperties
    className?: string
}

export function Flex(props: FlexProps) {
    const direction = props.direction ?? "horizontal"
    const reverse = props.reverse ?? false
    const wrap = !props.nowrap
    const alignment = props.alignment ?? "start"
    const children = Array.isArray(props.children) ? props.children : [props.children]
    const style: React.CSSProperties = {
        display: "flex",
        flexDirection: `${flexDirectionMapping[direction]}${ reverse ? "-reverse" : "" }`,
        gap: props.spacing,
        flexWrap: wrap ? "wrap" : "nowrap",
        justifyContent: flexAlignmentMapping[alignment],
        ...props.style
    }
    return <div style={style} className={props.className}>
        {children}
    </div>
}

export type StackLayoutItem = "auto" | `${number}fr`

export interface StackProps {
    spacing?: number
    layout: StackLayoutItem[]
    children: NodeChildren
    className?: string
    style?: CSSProperties
}

export function VStack(props: StackProps) {
    const style: CSSProperties = {
        gap: props.spacing,
        display: "grid",
        gridTemplateRows: props.layout.join(" "),
        gridTemplateColumns: "1fr",
        ...props.style
    }
    return <div style={style} className={props.className}>
        {props.children}
    </div>
}

export function HStack(props: StackProps) {
    const style: CSSProperties = {
        gap: props.spacing,
        display: "grid",
        gridTemplateRows: "1fr",
        gridTemplateColumns: props.layout.join(" "),
        ...props.style
    }
    return <div style={style} className={props.className}>
        {props.children}
    </div>
}
