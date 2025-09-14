
export interface UploadedFile {
    url: string
    filename: string
    size: number
    type: string
    blobUrl: string
}

export async function uploadFile(file: File): Promise<UploadedFile> {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
    })

    const data = await res.json()

    if (!res.ok) {
        throw new Error(data.error || 'Upload failed')
    }

    return data as UploadedFile
}

export async function uploadBlob(blob: Blob, filename = 'upload.pdf') {
    const formData = new FormData()
    formData.append('file', new File([blob], filename, { type: blob.type }))

    const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
    })

    const data = await res.json()

    if (!res.ok) {
        throw new Error(data.error || 'Upload failed')
    }

    return data as UploadedFile
}
