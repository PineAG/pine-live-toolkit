import { CSSProperties } from "react";
import { Rect, Size } from "../../backend";

export interface PanelProps {
    panelId: number
}

export function convertRectToStyle(size: Rect): Partial<CSSProperties> {
    return {
        display: "block",
        position: "absolute",
        left: size.x,
        top: size.y,
        width: size.width,
        height: size.height
    }
}

export function convertSizeToStyle(size: Size): Partial<CSSProperties> {
    return {
        display: "block",
        position: "absolute",
        width: size.width,
        height: size.height
    }
}
