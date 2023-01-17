import {fork} from "child_process"
import {app, BrowserWindow} from "electron"
import path from "path"

const PORT = 12219

const serverFile = path.resolve(__dirname, "server.js")
const serverProcess = fork(serverFile, [`${PORT}`], {stdio: "inherit"})

async function tryLoadURL(window: BrowserWindow, url: string) {
    let retry = true
    while(retry) {
        try{
            await window.loadURL(url)
            retry = false
        }catch(e) {
            console.error(e)
            await new Promise((resolve, reject) => {
                setTimeout(resolve, 1000)
            })
        }
    }
    window.show()
}

app.on("ready", () => {
    const window = new BrowserWindow({
        title: "Pine's Live Toolkit",
        width: 1280, height: 720,
        autoHideMenuBar: true,
        icon: path.resolve(__dirname, "icon.png")
    })
    const url = `http://127.0.0.1:${PORT}/`
    tryLoadURL(window, url)
})

app.on("window-all-closed", () => {
    app.quit()
    serverProcess.kill()
})
