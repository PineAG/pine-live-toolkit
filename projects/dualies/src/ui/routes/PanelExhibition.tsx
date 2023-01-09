import { PreviewWidget } from "../components/widgets"
import { PanelIdProvider, usePanel, useWidgetListOfPanel, WidgetProvider } from "../backend"
import { unwrapAsyncSubs } from "../components/subs"
import { usePanelIdFromParams } from "./utils"
import { PanelSize, PanelSizeContext } from "../components/context"

function PanelExhibitionBody() {
    const panelReq = usePanel()
    const widgetsReq = useWidgetListOfPanel()
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
