export async function readFileToBlob(file: File): Promise<Blob> {
    const reader = file.stream().getReader()
    const blobParts: Uint8Array[] = []
    let res = await reader.read()
    while(!res.done) {
        blobParts.push(res.value)
        res = await reader.read()
    }
    if(res.value !== undefined) {
        blobParts.push(res.value)
    }
    return new Blob(blobParts)
}