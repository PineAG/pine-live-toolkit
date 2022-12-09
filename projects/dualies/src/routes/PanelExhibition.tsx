import Loading from "../components/Loading"
import { AutoScale } from "../components/panels/AutoScale"
import { PreviewPlugin } from "../components/plugins"
import { usePanel } from "../store"
import { usePanelId } from "./utils"

export const PanelExhibitionPage = () => {
    const panelId = usePanelId()
    const panel = usePanel(panelId)
    if(panel === null){
        return <Loading/>
    }
    return <AutoScale internalSize={panel.size}>
        {panel.pluginsList.map(pluginId => (
            <PreviewPlugin
                key={pluginId}
                panelId={panelId}
                pluginId={pluginId}
            />
        ))}
    </AutoScale>
}