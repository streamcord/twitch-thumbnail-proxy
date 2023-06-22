/**
 * Fetches the stream thumbnail for the specified user.
 * 
 * @param url The URL of the thumbnail to fetch.
 * @returns A `Blob` containing the response body, along with the response's content type. Returns `null` upon error.
 */
export async function fetchThumbnail(url: string): Promise<[Blob | null, string | null]> {
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
        console.error(`failed to get thumbnail (${res.status}): ${await res.text()}`)
        return [null, null]
    } else if (res.headers.get('X-404-Redirect') === 'true') {
        console.log('request for thumbnail returned soft 404')
        return [null, null]
    }
    return [await res.blob(), res.headers.get('content-type')]
}
