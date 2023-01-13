import { Card as AntdCard, Divider as AntdDivider } from "antd"
import { CSSProperties } from "react"

export interface CardGridItem {
    key?: string | number
    style?: CSSProperties
    onClick?: () => void
    content?: string | JSX.Element | JSX.Element[]
}

export interface CardGridProps {
    title?: string
    style?: CSSProperties
    itemStyle?: CSSProperties
    items: CardGridItem[]
    columns?: number
}

export function CardGrid(props: CardGridProps) {
    const itemStyle: CSSProperties = {
        ...props.itemStyle
    }
    if(props.columns !== undefined) {
        itemStyle.width = `${Math.floor(100 / props.columns)}%`
    }
    return <AntdCard title={props.title} style={props.style}>
        {
            props.items.map((item, i) => (
                <AntdCard.Grid onClick={item.onClick} key={item.key ?? i} style={{...itemStyle, ...item.style}}>
                    {item.content}
                </AntdCard.Grid>
            ))
        }
    </AntdCard>
}

export interface SimpleCardProps {
    children: React.ReactNode
}

export function SimpleCard(props: SimpleCardProps) {
    return <AntdCard>
        {props.children}
    </AntdCard>
}

export interface CardWithActionsProps {
    title?: string
    actions: React.ReactNode[]
    children: React.ReactNode
    style?: React.CSSProperties
}

export function CardWithActions(props: CardWithActionsProps) {
    return <AntdCard title={props.title} actions={props.actions} style={props.style}>
        {props.children}
    </AntdCard>
}

export function Divider() {
    return <AntdDivider/>
}