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

exports.installAllDependencies = async () => {
    await installProjectDependencies("client")
    await installProjectDependencies("components")
    await installProjectDependencies("dualies")
}

exports.enableDemoFeatures = async () => {
    const featureFile = path.resolve(rootDir, "projects", "dualies", "src", "features.json")
    const features = JSON.parse(await fs.readFile(featureFile))
    Object.assign(features, {
        Use_LocalStorage_Backend: true,
        Show_Demo_Message: true
    })
    await fs.writeFile(featureFile, JSON.stringify(features))
}

exports.buildAllProjects = async () => {
    await buildProject("client")
    await buildProject("components")
    await buildProject("dualies")
}
