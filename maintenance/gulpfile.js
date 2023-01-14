const gulp = require("gulp")
const process = require("process")
const path = require("path")
const fs = require("fs/promises")
const {existsSync} = require("fs")

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

function execCommandGettingOutput(command) {
    const {exec} = require("child_process")
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            console.warn(stderr)
            if(error) {
                reject(error)
            } else {
                resolve(stdout)
            }
        })
    })
}

async function getProjectPackageName(projName) {
    const projDir = path.resolve(rootDir, "projects", projName)
    const packageFile = path.resolve(projDir, "package.json")
    const package = JSON.parse(await fs.readFile(packageFile, {encoding: "utf-8"}))
    const packageName = package["name"]
    return packageName
}

async function getProjectVersion(packageName) {
    console.log("Retrieving version of", packageName)
    let version = null
    try {
        version = await execCommandGettingOutput(`npm view ${packageName} version`)
        version = version.trim()
    } catch(e) {
        console.error(e)
    }
    return version
}

function nextPatchVersion(version) {
    if(!version) {
        return "1.0.0"
    } else {
        let [major, minor, patch] = version.split(".")
        patch = parseInt(patch)
        patch++
        return `${major}.${minor}.${patch}`
    }
}

async function initializeGitConfig() {
    await execCommand("git", ["config", "user.name", "AgailAutomation"])
    await execCommand("git", ["config", "user.email", "automation@pine-ag.com"])
}

async function buildProject(projName) {
    const projDir = path.resolve(rootDir, "projects", projName)
    await execCommand("yarn", ["run", "build"], projDir)
}

async function installProjectDependencies(projName) {
    const projDir = path.resolve(rootDir, "projects", projName)
    await execCommand("yarn", ["install"], projDir)
}

async function publishDependency(projName) {
    const projDir = path.resolve(rootDir, "projects", projName)
    let packageName = await getProjectPackageName(projName)
    let version = await getProjectVersion(packageName)
    version = nextPatchVersion(version)
    console.log("Using version", version, "for", packageName)
    await initializeGitConfig()
    await execCommand("yarn", ["publish", "--access", "public", "--new-version", version], projDir)
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
    const featureFile = path.resolve(rootDir, "projects", "frontend", "src", "features.json")
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
    await buildProject("backend-rest-server")
}

exports.buildApps = async () => {
    await buildProject("server")
    await buildProject("frontend")
}

exports.watchDependencies = gulp.task("watchDependencies", () => {
    watchProject("protocol")
    watchProject("components")
})

exports.publishAllLibraries = async () => {
    await publishDependency("protocol")
    await publishDependency("components")
    await publishDependency("backend-kv-adapter")
    await publishDependency("backend-indexeddb")
    await publishDependency("backend-rest-client")
    await publishDependency("backend-rest-server")
}

async function copyBackendProject(src, dst) {
    await fs.mkdir(dst)
    await fs.cp(path.resolve(src, "lib"), path.resolve(dst, "lib"), {recursive: true})
    await fs.copyFile(path.resolve(src, "package.json"), path.resolve(dst, "package.json"))
}

exports.bundleBackend = async () => {
    const outDir = path.resolve(rootDir, "backend-release")
    if(existsSync(outDir)){
        await fs.rm(outDir, {recursive: true})
    }
    await fs.mkdir(outDir)
    const projDir = path.resolve(outDir, "projects")
    await fs.mkdir(projDir)
    const projects = [
        "protocol",
        "backend-rest-server",
        "server"
    ]
    for(const p of projects) {
        await copyBackendProject(path.resolve(rootDir, "projects", p), path.resolve(projDir, p))
    }
    await fs.copyFile(path.resolve(rootDir, ".docker", "package.json"), path.resolve(outDir, "package.json"))
    await fs.copyFile(path.resolve(rootDir, ".docker", "start.sh"), path.resolve(outDir, "projects", "server", "start.sh"))
}
