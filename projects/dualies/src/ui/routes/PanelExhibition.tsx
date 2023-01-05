import Loading from "../components/Loading"
import { PreviewPlugin } from "../components/plugins"
import { usePanel } from "../backend"
import { usePanelId } from "./utils"

export const PanelExhibitionPage = () => {
    const panelId = usePanelId()
    const panel = usePanel(panelId)
    if(panel === null){
        return <Loading/>
    }
    return <div style={panel.size}>
        {panel.pluginsList.map(pluginId => (
            <PreviewPlugin
                key={pluginId}
                panelId={panelId}
                pluginId={pluginId}
            />
        ))}
    </div>
}