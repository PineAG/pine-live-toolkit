import {spawn} from "child_process"
import {app, BrowserWindow} from "electron"
import path from "path"

const PORT = 12219

const serverFile = path.resolve(__dirname, "server.js")
const serverProcess = spawn(process.execPath, [serverFile, `${PORT}`], {stdio: "inherit"})

app.on("ready", () => {
    const window = new BrowserWindow({
        title: "Pine's Live Toolkit",
        width: 1280, height: 720,
        autoHideMenuBar: true
    })
    const url = `http://127.0.0.1:${PORT}/`
    window.loadURL(url)
    window.show()
})

app.on("window-all-closed", () => {
    app.quit()
    serverProcess.kill()
})
