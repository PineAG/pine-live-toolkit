import { createContext, useContext, useEffect, useState } from "react"
import { useLiveToolkitFileStorage } from "./base"

export class FileObjectURLCache {
    private refCounter: Record<string, number> = {}
    private objectURL: Record<string, string> = {}

    async getURL(id: string, loader: (id: string) => Promise<Blob>): Promise<string> {
        if(id in this.objectURL) {
            this.refCounter[id] ++
            return this.objectURL[id]
        } else {
            const data = await loader(id)
            const url = URL.createObjectURL(data)
            this.refCounter[id] = 1
            this.objectURL[id] = url
            return url
        }
    }
    async dispose(id: string) {
        const latestCount = -- this.refCounter[id]
        if(latestCount === 0) {
            delete this.refCounter[id]
            const url = this.objectURL[id]
            delete this.objectURL[id]
            URL.revokeObjectURL(url)
        }
    }
}

const FileObjectURLCacheContext = createContext(new FileObjectURLCache())
export const FileObjectURLCacheProvider = FileObjectURLCacheContext.Provider

export type UseFileIdResult = {status: "Pending" | "NotFound"} | {status: "Loaded", url: string}

export function useFileId(fileId: string | null): UseFileIdResult {
    const store = useContext(FileObjectURLCacheContext)
    const [result, setResult] = useState<UseFileIdResult>({status: "Pending"})
    const fileClient = useLiveToolkitFileStorage()
    useEffect(() => {
        if(fileId) {
            setResult({status: "Pending"})
            store.getURL(fileId, (id) => {
                return fileClient.fetch(id)
            }).then(url => {
                if(url) {
                    setResult({status: "Loaded", url})
                }
            })
            return () => store.dispose(fileId)
        } else {
            setResult({status: "NotFound"})
        }
        return () => {}
    }, [fileId])
    return result
}

export async function readFileToBlob(file: File): Promise<Blob> {
    const reader = file.stream().getReader()
    let res = await reader.read()
    const parts: Uint8Array[] = []
    while(!res.done) {
        parts.push(res.value)
        res = await reader.read()
    }
    if(res.value !== undefined) {
        parts.push(res.value)
    }
    return new Blob(parts)
}
