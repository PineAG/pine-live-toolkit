import { TransparentBackground } from "../components/backgrounds"
import Loading from "../components/Loading"
import { KeepRatio } from "../components/panels/KeepRatio"
import { EditablePlugin } from "../components/plugins"
import { Rect, usePanel } from "../store"
import { usePanelId } from "./utils"
import "./Panel.css"
import { PanelElementSizeContext } from "../components/context"
import { useRef } from "react"


function convertDomRectToRect(rect: DOMRect | undefined): Rect {
    if(rect === undefined) {
        return {x: 0, y: 0, width: 1, height: 1}
    }
    const {width, height, x, y} = rect
    return {width, height, x, y}
}

export const PanelPage = () => {
    const panelId = usePanelId()
    const panel = usePanel(panelId)
    const ref = useRef<HTMLDivElement>(null)
    if(!panel){
        return <Loading/>
    }
    return <div className="route-panel-root">
        <div className="route-panel-body" ref={ref}>
            <PanelElementSizeContext.Provider value={convertDomRectToRect(ref.current?.getBoundingClientRect())}>
            <KeepRatio internalSize={panel.size}>
                <TransparentBackground/>
                <>
                {panel.pluginsList.map(pluginId => (
                    <EditablePlugin
                        key={pluginId}
                        panelId={panelId}
                        pluginId={pluginId}
                    />
                ))}
                </>
            </KeepRatio>
            </PanelElementSizeContext.Provider>
        </div>
    </div>
}
