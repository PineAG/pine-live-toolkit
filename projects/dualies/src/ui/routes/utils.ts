import { useParams } from "react-router-dom"

export function usePanelId() {
    const {panelId} = useParams()
    if(!panelId) {
        throw new Error(`Invalid panel id: ${panelId}`)
    }
    const id = parseInt(panelId)
    if(isNaN(id)){
        throw new Error(`Invalid panel id: ${panelId}`)
    }
    return id
}
