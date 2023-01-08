import { PreviewWidget } from "../components/widgets"
import { PanelIdProvider, usePanel, useWidgetListOfPanel, WidgetProvider } from "../backend"
import { unwrapAsyncSubs } from "../components/subs"
import { usePanelIdFromParams } from "./utils"

function PanelExhibitionBody() {
    const panelReq = usePanel()
    const widgetsReq = useWidgetListOfPanel()
    return unwrapAsyncSubs(panelReq, panel => (
        unwrapAsyncSubs(widgetsReq, widgets => (
        <div style={panel.size}>
            {widgets.map(widget => (
                <WidgetProvider value={widget} key={widget.id}>
                    <PreviewWidget
                        widget={widget}
                    />
                </WidgetProvider>
            ))}
        </div>
        ))
    ))
}

export function PanelExhibitionPage(){
    const panelId = usePanelIdFromParams()
    return <PanelIdProvider value={panelId}>
        <PanelExhibitionBody/>
    </PanelIdProvider>
}
