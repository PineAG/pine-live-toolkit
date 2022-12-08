import { useState } from "react"
import { Size, usePanel } from "../../store"
import Loading from "../Loading"
import { convertSizeToStyle, PanelProps } from "./base"

export const PanelPreview = (props: PanelProps) => {
    const store = usePanel(props.panelId)
    if(!store) {
        return <Loading/>
    }
    return <div style={convertSizeToStyle(store.size)}>
        {/* <ResizableFramework rect={store.size} onSizeChanged={store.resize}>
        </ResizableFramework> */}
    </div>
}
