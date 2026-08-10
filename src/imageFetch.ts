export class ThumbnailFetchError extends Error {
    public isSoft404: boolean

    constructor(message: string, isSoft404: boolean) {
        super(`failed to fetch thumbnail: ${message}`)
        this.isSoft404 = isSoft404
    }
}

/**
 * Fetches the stream thumbnail for the specified user.
 * 
 * @param url The URL of the thumbnail to fetch.
 * @returns A `Blob` containing the response body, along with the response's content type. Throws `ThumbnailFetchError`.
 */
export async function fetchThumbnail(url: string): Promise<[Blob, string]> {
    const res = await fetch(
        url,
        {
            cf: {
                cacheTtl: 0,
                polish: 'lossy'
            },
            redirect: 'manual'
        }
    )

    if (res.status >= 400) {
        throw new ThumbnailFetchError(`request failed with status code ${res.status}: ${await res.text()}`, false)
    } else if (res.headers.get('X-404-Redirect') === 'true') {
        throw new ThumbnailFetchError('request failed with soft 404', true)
    }
    return [await res.blob(), res.headers.get('content-type')!]
}
