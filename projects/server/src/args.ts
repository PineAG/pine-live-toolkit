import minimist from "minimist"
import { error } from "./utils"

export interface LiveToolkitArgs {
    port: number
    dbRoot: string
    filesRoot: string
}

export function parseArguments(): LiveToolkitArgs {
    const result = minimist(process.argv.slice(1), {
        string: ["dbRoot", "filesRoot", "port"], 
    })
    function arg(name: keyof LiveToolkitArgs) {
        return result[name] ?? error(`Missing argument: ${name}`)
    }
    return {
        port: parseInt(arg("port")),
        dbRoot: arg("dbRoot"),
        filesRoot: arg("filesRoot")
    }
}