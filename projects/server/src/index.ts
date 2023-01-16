import "reflect-metadata"

import { parseArguments } from "./args"
import { connectDB } from "./models"
import { ServerSideFilesStorage } from "./files"
import {startLiveToolkitServer} from "@pltk/restful-backend-server"
import { ServerSideDataWrapper } from "@pltk/sql-backend"


function main() {
    const args = parseArguments()
    const dataSource = connectDB(args.dbRoot)
    const api = new ServerSideDataWrapper(dataSource)
    const fileClient = new ServerSideFilesStorage(args.filesRoot)

    startLiveToolkitServer({
        dataClient: api,
        filesClient: fileClient,
        port: args.port,
        staticRoot: args.staticRoot
    })
}

main()
