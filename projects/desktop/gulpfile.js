const fs = require("fs/promises")
const {existsSync} = require("fs")
const path = require("path")
const gulp = require("gulp")

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

exports.buildTypescript = gulp.task("buildTypescript", async function(){
    await execCommand("npx", ["tsc", "--build", "--verbose"], ".")
})

exports.copyFrontendFiles = gulp.task("copyFrontendFiles", async function() {
    const src = path.resolve(__dirname, "..", "frontend", "build")
    const dst = path.resolve(__dirname, "lib", "static")
    if(existsSync(dst)) {
        await fs.rm(dst, {recursive: true})
    }
    await fs.cp(src, dst, {recursive: true})
})


exports.initializePackages = gulp.task("initializePackages", async function() {
    const srcPackageJson = path.resolve(__dirname, "package.json")
    const dstPackageJson = path.resolve(__dirname, "lib", "package.json")
    if(existsSync(dstPackageJson)){
        await fs.rm(dstPackageJson)
    }
    await fs.cp(srcPackageJson, dstPackageJson)
    await execCommand("yarn", ["install", "--production"], path.resolve(__dirname, "lib"))
})

exports.cleanUserData = gulp.task("cleanUserData", async function() {
    for(const name of ["data", "files"]) {
        const p = path.resolve(__dirname, "lib", name)
        if(existsSync(p)){
            await fs.rm(p, {recursive: true})
        }
    }
})

exports.copyAssets = gulp.task("copyAssets", () => {
    return gulp.src("./src/**/*.png").pipe(gulp.dest("./lib"))
})

async function createPackage({platform, arch}) {
    const packageName = "PineLiveToolkit"
    const target = path.resolve(__dirname, "build", `${packageName}-${platform}-${arch}`)
    if(existsSync(target)){
        await fs.rm(target, {recursive: true})
    }
    await execCommand("npx", ["electron-packager", "lib", packageName, "--out=build", `--platform=${platform}`, `--arch=${arch}`, "--no-prune"], ".")
}

exports.createPackage_win32_x64 = gulp.task("createPackage_win32_x64", async function() {
    createPackage({platform: "win32", arch: "x64"})
})

exports.buildDevelopment = gulp.task("buildDevelopment", gulp.series("buildTypescript", "copyAssets", "copyFrontendFiles"))
exports.buildProduction = gulp.task("buildProduction", gulp.series("buildTypescript", "copyAssets", "copyFrontendFiles", "cleanUserData", "initializePackages", "createPackage_win32_x64"))
