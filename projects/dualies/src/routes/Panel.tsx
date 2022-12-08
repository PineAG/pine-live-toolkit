import { TransparentBackground } from "../components/backgrounds"
import Loading from "../components/Loading"
import { KeepRatio } from "../components/panels/KeepRatio"
import { EditablePlugin } from "../components/plugins"
import { usePanel } from "../store"
import { usePanelId } from "./utils"

export const PanelPage = () => {
    const panelId = usePanelId()
    const panel = usePanel(panelId)
    if(!panel){
        return <Loading/>
    }
    return <KeepRatio internalSize={panel.size}>
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
}
