import { Plugin } from "../ui"
import ChecklistPlugin from "./Checklist"
import ClockPlugin from "./Clock"
import ImageViewerPlugin from "./ImageViewer"
import TextPlugin from "./Text"

export const builtinPlugins: Plugin<any>[] = [
    ClockPlugin,
    TextPlugin,
    ImageViewerPlugin,
    ChecklistPlugin
]

export default builtinPlugins