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
        child.on("close", code => {
            if(code === 0) {
                resolve(code)
            } else {
                reject(code)
            }
        })
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


exports.buildLibs = async () => {
    await buildProject("components")
    await buildProject("protocol")
    await buildProject("backend-kv-adapter")
    await buildProject("backend-indexeddb")
    await buildProject("backend-rest-client")
}

exports.buildApps = async () => {
    await buildProject("server")
    await buildProject("dualies")
}

exports.watchDependencies = gulp.task("watchDependencies", () => {
    watchProject("protocol")
    watchProject("components")
})
