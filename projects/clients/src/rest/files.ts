import { ClientBase, ClientOptions } from "./base";

export class FileClient extends ClientBase {
    async create(data: string | Blob): Promise<string> {
        const res = await fetch(`${this.httpPath}/`, {
            method: "POST",
            body: data
        })
        if(res.status !== 200) {
            throw new Error(`${res.status}: ${res.statusText}`)
        }
        return res.text()
    }

    async update(id: string, data: string | Blob) {
        const res = await fetch(`${this.httpPath}/${id}`, {
            method: "PUT",
            body: data
        })
        if(res.status !== 200) {
            throw new Error(`${res.status}: ${res.statusText}`)
        }
    }

    async read(id: string): Promise<Blob> {
        const res = await fetch(`${this.httpPath}/${id}`)
        if(res.status !== 200) {
            throw new Error(`${res.status}: ${res.statusText}`)
        }
        const r = await res.body?.getReader().read()
        const value = r?.value
        if(!value){
            throw new Error("Empty body")
        }
        return new Blob([value])
    }

    async delete(id: string) {
        const res = await fetch (`${this.httpPath}/${id}`, {method: "DELETE"})
        if(res.status !== 200) {
            throw new Error(`${res.status}: ${res.statusText}`)
        }
    }
}
