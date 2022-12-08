import { TransparentBackground } from "../components/backgrounds"
import Loading from "../components/Loading"
import { KeepRatio } from "../components/panels/KeepRatio"
import { EditablePlugin } from "../components/plugins"
import { usePanel } from "../store"
import { usePanelId } from "./utils"
import "./Panel.css"

export const PanelPage = () => {
    const panelId = usePanelId()
    const panel = usePanel(panelId)
    if(!panel){
        return <Loading/>
    }
    return <div className="route-panel-root">
        <div className="route-panel-body">
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
        </div>
    </div>
}
