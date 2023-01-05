const gulp = require("gulp")
const process = require("process")
const path = require("path")

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

exports.buildAllProjects = async () => {
    await buildProject("client")
    await buildProject("components")
    await buildProject("dualies")
}
