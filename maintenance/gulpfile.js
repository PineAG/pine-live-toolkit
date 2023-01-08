const gulp = require("gulp")
const process = require("process")
const path = require("path")
const fs = require("fs/promises")

const rootDir = path.resolve(__dirname, "..")

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
        child.on("close", code => resolve(code))
    })
} 

async function buildProject(projName) {
    const projDir = path.resolve(rootDir, "projects", projName)
    await execCommand("yarn", ["run", "build"], projDir)
}

async function installProjectDependencies(projName) {
    const projDir = path.resolve(rootDir, "projects", projName)
    await execCommand("yarn", ["install"], projDir)
}

function watchProject(projName) {
    const projDir = path.resolve(rootDir, "projects", projName)
    const files = ["./src/**/*.ts", "./src/**/*.tsx", "./src/**/*.json", "./src/**/*.css"]
    return gulp.watch(files, {
        cwd: projDir,
        ignoreInitial: false
        
    }, () => buildProject(projDir))
}

exports.installAllDependencies = async () => {
    await installProjectDependencies("clients")
    await installProjectDependencies("components")
    await installProjectDependencies("dualies")
}

async function updateFeatures(newfeatures) {
    const featureFile = path.resolve(rootDir, "projects", "dualies", "src", "features.json")
    const features = JSON.parse(await fs.readFile(featureFile))
    Object.assign(features, newfeatures)
    await fs.writeFile(featureFile, JSON.stringify(features))
}

exports.enableDemoFeatures = async () => {
    await updateFeatures({
        Use_LocalStorage_Backend: true,
        Show_Demo_Message: true
    })
}

exports.enableProductionFeatures = async () => {
    await updateFeatures({
        Use_LocalStorage_Backend: false,
        Show_Demo_Message: false
    })
}

exports.buildAllProjects = async () => {
    await buildProject("clients")
    await buildProject("components")
    await buildProject("dualies")
}

exports.watchDependencies = gulp.task("watchDependencies", () => {
    watchProject("clients")
    watchProject("components")
})

exports.generateServerSchema = async () => {
    const projDir = path.resolve(rootDir, "projects", "server")
    const types = ["IDType", "PanelType", "WidgetType", "RectType", "WidgetMetaType", "SizeType", "PanelMetaType"]
    for(const t of types) {
        await execCommand("npx", ["typescript-json-schema", "./src/schema/types.ts", t, "-o", `./src/schema/${t}.json`], projDir)
    }
}
