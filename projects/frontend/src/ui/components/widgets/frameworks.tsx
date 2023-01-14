import { Rect, Size } from "@pltk/protocol"
import { CSSProperties, useEffect, useState } from "react"
import * as rnd from "react-rnd"
import { useLiveToolkitClient } from "../../backend"
import { useNullableContext } from "../../backend/hooks/utils"
import { PanelSizeContext } from "../context"


export interface FrameworkProps {
    rect: Rect
    children: React.ReactNode | React.ReactNode[]
    attachments?: React.ReactElement | React.ReactElement[]
    style?: React.CSSProperties
}

export const PreviewFramework = (props: FrameworkProps) => {
    const {scale} = useNullableContext(PanelSizeContext)
    const {x, y, width, height} = props.rect
    const style: CSSProperties = {
        left: x * scale,
        top: y * scale,
        width: width * scale,
        height: height * scale,
        position: "absolute",
        overflow: "hidden",
        ...props.style
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


export const ScaledFramework = (props: FrameworkProps) => {
    const {scale} = useNullableContext(PanelSizeContext)
    const {x, y, width, height} = props.rect
    const style: CSSProperties = {
        left: x * scale,
        top: y * scale,
        width: width * scale,
        height: height * scale,
        position: "absolute",
        ...props.style,
    }
    const wrapperStyle: CSSProperties = {
        position: "absolute",
        left: 0, top: 0,
        width: `${100 / scale}%`,
        height: `${100 / scale}%`,
        transform: `scale(${scale})`,
        transformOrigin: "left top",
        overflow: "hidden",
    }
    return <div style={style}>
        <div style={wrapperStyle}>
            {props.children}
        </div>
        {props.attachments}
    </div>
}

export interface ResizableFrameworkProps extends FrameworkProps {
    onSizeChanged: (size: Rect) => void
}

function isValidRect({x, y, width, height}: Rect, parentSize: Size): boolean {
    const safeGap = 5
    const parentWidth = parentSize.width
    const parentHeight = parentSize.height
    const left = x, right = x + width, top = y, bottom = y + height
    return left < parentWidth - safeGap && right > safeGap && top < parentHeight - safeGap && bottom > safeGap
}

export function ResizableFramework(props: ResizableFrameworkProps) {
    const {scale, configSize, actualRect} = useNullableContext(PanelSizeContext)
    const [rect, setRect] = useState<Rect>(applyRect(props.rect))
    function recoverRect({x, y, width, height}: Rect) {
        return {
            x: x / scale,
            y: y / scale,
            width: width / scale,
            height: height / scale,
        }
    }
    function applyRect({x, y, width, height}: Rect): Rect {
        return {
            x: x * scale,
            y: y * scale,
            width: width * scale,
            height: height * scale
        }
    }
    function onUpdateHTMLElement(ref: HTMLElement) {
        let {x, y, width, height} = ref.getBoundingClientRect()
        x -= actualRect.x
        y -= actualRect.y
        const rect = {x, y, width, height}
        if(isValidRect(rect, actualRect)) {
            setRect(rect)
        }
    }
    function onUpdateHTMLElementSaved(ref: HTMLElement) {
        let {x, y, width, height} = ref.getBoundingClientRect()
        x -= actualRect.x
        y -= actualRect.y
        const rect = {x, y, width, height}
        if(isValidRect(rect, configSize)) {
            props.onSizeChanged(recoverRect(rect))
        }
    }
    return <rnd.Rnd 
        style={props.style} 
        size={rect}
        position={rect}
        onResize={(e, direction, ref, delta, position) => onUpdateHTMLElement(ref)}
        onDrag={(e, data) => onUpdateHTMLElement(data.node)}
        onResizeStop={(e, direction, ref, delta, position) => onUpdateHTMLElementSaved(ref)}
        onDragStop={(e, data) => onUpdateHTMLElementSaved(data.node)}
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
