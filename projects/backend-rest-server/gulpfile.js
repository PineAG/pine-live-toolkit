const path = require("path")

function execCommand(command, args, cwd) {
    const {spawn} = require("child_process")
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            stdio: "inherit",
            cwd: cwd,
            env: process.env,
            shell: true
        })
        child.on("error", code => reject(code))
        child.on("close", code => {
            if(code === 0) {
                resolve(code)
            } else {
                reject(code)
            }
        })
    })
}

exports.generateSchema = async function() {
    const schemaRoot = path.resolve(".", "src", "schema")
    const typeFile = path.resolve(schemaRoot, "types.ts")
    const types = ["IDType", "PanelType", "WidgetType", "RectType", "WidgetMetaType", "SizeType", "PanelMetaType", "EventType"]
    for(const t of types) {
        const outFile = path.resolve(schemaRoot, `${t}.json`)
        await execCommand("npx", ["typescript-json-schema", typeFile, t, "-o", outFile], ".")
    }
}