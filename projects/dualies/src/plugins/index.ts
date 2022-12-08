import {Plugin} from "./base"
import ClockPlugin from "./Clock"

const plugins: Plugin<any>[] = [
    ClockPlugin,
]

export const enabledPlugins: {[key: string]: Plugin<any>} = {}

for(const p of plugins) {
    enabledPlugins[p.type] = p
}
