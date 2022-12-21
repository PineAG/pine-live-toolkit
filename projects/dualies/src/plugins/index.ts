import {Plugin} from "./base"
import ChecklistPlugin from "./Checklist"
import ClockPlugin from "./Clock"
import ImageViewerPlugin from "./ImageViewer"
import TextPlugin from "./Text"

export const enabledPluginsList: Plugin<any>[] = [
    ClockPlugin,
    TextPlugin,
    ImageViewerPlugin,
    ChecklistPlugin
]

export const enabledPlugins: {[key: string]: Plugin<any>} = {}

for(const p of enabledPluginsList) {
    enabledPlugins[p.type] = p
}
