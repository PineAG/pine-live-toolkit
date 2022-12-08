import { ClientBase, FullClientOptions } from "./base"
import {JsonDataClient} from "./data"
import {FileClient} from "./files"

export * from "./data"
export * from "./files"

export class DualiesClient extends ClientBase {
    private optionsWithPath(name: string): FullClientOptions {
        const {path, ...rest} = this.options
        return {
            path: `${path}/${name}`,
            ...rest
        }
    }

    data<T>(path: string): JsonDataClient<T> {
        path = path.replace(/^\/+/, "")
        return new JsonDataClient(this.optionsWithPath(`data/${path}`))
    }

    files(): FileClient {
        return new FileClient(this.optionsWithPath("files"))
    }
}

export default DualiesClient
