import {Plugin} from "./base"
import ClockPlugin from "./Clock"
import ImageViewerPlugin from "./ImageViewer"

export const enabledPluginsList: Plugin<any>[] = [
    ClockPlugin,
    ImageViewerPlugin,
]

export const enabledPlugins: {[key: string]: Plugin<any>} = {}

for(const p of enabledPluginsList) {
    enabledPlugins[p.type] = p
}
