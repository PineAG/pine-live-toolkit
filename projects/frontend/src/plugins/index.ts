import { WidgetDefinition } from "../ui"
import ChecklistPlugin from "./Checklist"
import ClockPlugin from "./Clock"
import ImageViewerPlugin from "./ImageViewer"
import TextPlugin from "./Text"

export const builtinPlugins: WidgetDefinition<any>[] = [
    ClockPlugin,
    TextPlugin,
    ImageViewerPlugin,
    ChecklistPlugin
]

export default builtinPlugins
