export interface FullClientOptions {
    host: string
    path: string
    tls: boolean
}

export interface ClientOptions {
    host?: string
    path?: string
    tls?: boolean
}

export function completeOptions(opts: ClientOptions): FullClientOptions {
    let {host, path, tls} = opts
    if(host === undefined) {
        host = globalThis.location.host
    }
    if(tls === undefined) {
        tls = location.protocol === "https:"
    }
    if(path === undefined) {
        path = "/"
    }
    return {host, path, tls}
}

export class ClientBase {
    protected options: FullClientOptions
    constructor(opts: ClientOptions) {
        this.options = completeOptions(opts)
    }

    protected get httpPath() {
        const protocol = this.options.tls ? "https" : "http"
        const url = new URL(this.options.path, `${protocol}://${this.options.host}`)
        return url.toString()
    }

    protected get wsPath() {
        const protocol = this.options.tls ? "wss" : "ws"
        const url = new URL(this.options.path, `${protocol}://${this.options.host}`)
        return url.toString()
    }
}