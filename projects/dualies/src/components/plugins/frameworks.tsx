import {CSSProperties} from "react"
import * as rnd from "react-rnd"
import {useContext, useState, useEffect} from "react"
import { Position, Rect, Size } from "../../store"
import { PanelElementSizeContext, PanelSizeContext } from "../context"

const editableFrameworkStyles: rnd.Props["style"] = {
    borderStyle: "solid", 
    borderWidth: 1, 
    borderColor: "black"
}

export interface FixedFrameworkProps {
    rect: Rect
    children: React.ReactNode | React.ReactNode[]
    attachments?: React.ReactElement | React.ReactElement[]
}

export const FixedFramework = (props: FixedFrameworkProps) => {
    const {x, y, width, height} = props.rect
    const style: CSSProperties = {
        left: x,
        top: y,
        width: width,
        height: height,
        position: "absolute"
    }
    return <div style={style}>
        {props.children}
    </div>
}

export const ScaledFramework = (props: FixedFrameworkProps) => {
    const {scale} = useContext(PanelSizeContext)
    const {x, y, width, height} = props.rect
    const style: CSSProperties = {
        left: x * scale,
        top: y * scale,
        width: width * scale,
        height: height * scale,
        position: "absolute",
        borderStyle: "dashed",
        borderWidth: "1px",
        borderColor: "black",
        overflow: "hidden"
    }
    const wrapperStyle: CSSProperties = {
        position: "absolute",
        left: 0, top: 0,
        width: `${100 / scale}%`,
        height: `${100 / scale}%`,
        transform: `scale(${scale})`,
        transformOrigin: "left top"
    }
    return <div style={style}>
        <div style={wrapperStyle}>
            {props.children}
        </div>
        {props.attachments}
    </div>
}

export interface ResizableFrameworkProps extends FixedFrameworkProps {
    onSizeChanged: (size: Rect) => void
}

function rescaleRect({x, y, width, height}: Rect, scale: number): Rect {
    return {
        x: x * scale,
        y: y * scale,
        width: width * scale,
        height: height * scale
    }
}

function retrieveRectFromDom({x, y, width, height}: Rect, scale: number): Rect {
    return {
        x: x / scale,
        y: y / scale,
        width: width / scale,
        height: height / scale
    }
}

function isValidRect({x, y, width, height}: Rect, parentSize: Size, scale: number): boolean {
    const safeGap = 5
    const parentWidth = parentSize.width * scale
    const parentHeight = parentSize.height * scale
    const left = x, right = x + width, top = y, bottom = y + height
    return left < parentWidth - safeGap && right > safeGap && top < parentHeight - safeGap && bottom > safeGap
}

export const ResizableFramework = (props: ResizableFrameworkProps) => {
    const {scale, ...parentSize} = useContext(PanelSizeContext)
    const [rect, setRect] = useState<Rect>({x: 0, y: 0, width: 1, height: 1})
    const containerSize = useContext(PanelElementSizeContext)
    useEffect(() => {
        setRect(rescaleRect(props.rect, scale))
    }, [props.rect, scale])
    function setRectValidated(rect: Rect) {
        rect.x -= containerSize.x
        rect.y -= containerSize.y
        if(isValidRect(rect, parentSize, scale)) {
            setRect({
                width: rect.width,
                height: rect.height,
                x: rect.x,
                y: rect.y,
            })
        }
    }
    function updateRectValidated(rect: DOMRect) {
        rect.x -= containerSize.x
        rect.y -= containerSize.y
        if(isValidRect(rect, parentSize, scale)) {
            props.onSizeChanged(retrieveRectFromDom(rect, scale))
        }
    }
    const {x, y, width, height} = rect
    return <rnd.Rnd 
        style={editableFrameworkStyles} 
        size={{width, height}}
        position={{x, y}}
        onResize={(e, direction, ref, delta, position) => {
            const {x, y, width, height} = ref.getBoundingClientRect()
            setRectValidated({x, y, width, height})
        }}
        onDrag={
            (e, data) => {
                const {x, y, width, height} = data.node.getBoundingClientRect()
                setRectValidated({x, y, width, height})
        }}
        onResizeStop={
            (e, direction, ref, delta, position) => {
                const rect = ref.getBoundingClientRect()
                updateRectValidated(rect)
        }}
        onDragStop={
            (e, data) => {
                const rect = data.node.getBoundingClientRect()
                updateRectValidated(rect)
        }}
        >
        <div style={{
            position: "absolute",
            left: 0, top: 0,
            width: `${100 / scale}%`, height: `${100 / scale}%`,
            transformOrigin: "left top",
            transform: `scale(${scale})`,
            overflow: "hidden"
        }}>
            {props.children}
        </div>
        {props.attachments}
    </rnd.Rnd>
}
