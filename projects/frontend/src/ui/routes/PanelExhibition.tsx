import { PreviewWidget } from "../components/widgets"
import { PanelIdProvider, usePanel, usePanelId, useWidgetListOfPanel, WidgetProvider } from "../backend"
import { usePanelIdFromParams } from "./utils"
import { PanelSize, PanelSizeContext } from "../components/context"
import { unwrapAsyncSubs } from "@pltk/components"

function PanelExhibitionBody() {
    const panelId = usePanelId()
    const panelReq = usePanel(panelId)
    const widgetsReq = useWidgetListOfPanel(panelId)
    return unwrapAsyncSubs(panelReq, panel => {
        const panelSize: PanelSize = {
            scale: 1,
            configSize: panel.size,
            actualRect: {x: 0, y: 0, ...panel.size}
        }
        return unwrapAsyncSubs(widgetsReq, widgets => (
        <div style={panel.size}>
            <PanelSizeContext.Provider value={panelSize}>
            {widgets.map(widget => (
                <WidgetProvider value={widget} key={widget.id}>
                    <PreviewWidget
                        widget={widget}
                    />
                </WidgetProvider>
            ))}
            </PanelSizeContext.Provider>
        </div>
        ))
    })
}

export function PanelExhibitionPage(){
    const panelId = usePanelIdFromParams()
    return <PanelIdProvider value={panelId}>
        <PanelExhibitionBody/>
    </PanelIdProvider>
}
