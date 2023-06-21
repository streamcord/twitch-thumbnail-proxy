import Env from './env'
import { prepareFallbackResponse } from './response'
import { addHours } from './time'

/**
 * Fetches the stream thumbnail for the specified user, caches it, and prepares a response.
 */
export async function respondUncachedThumbnail(env: Env, userLogin: string, streamID: string): Promise<Response> {
    const thumbnail = await fetchThumbnail(userLogin)
    console.log(`GET ${thumbnail.url} - ${thumbnail.status} ${thumbnail.statusText}`)
    if (thumbnail.headers.get('X-404-Redirect') === 'true') {
        return prepareFallbackResponse(env)
    }

    const blob = await thumbnail.blob()
    const object = await cacheThumbnail(env, blob, thumbnail.headers, userLogin, streamID)

    const res = new Response(blob, {
        headers: {
            'Cache-Control': 'max-age=86400',
            'Etag': object.httpEtag,
            'Content-Type': thumbnail.headers.get('Content-Type') || '',
            'X-Cache': 'MISS'
        }
    })

    return res
}

async function fetchThumbnail(userLogin: string) {
    const url = `https://static-cdn.jtvnw.net/previews-ttv/live_user_${userLogin}-1280x720.jpg`
    return await fetch(
        url,
        {
            cf: {
                cacheTtl: 0,
                polish: 'lossy'
            },
            redirect: 'manual'
        }
    )
}

async function cacheThumbnail(env: Env, blob: Blob, headers: Headers, userLogin: string, streamID: string) {
    return env.BUCKET.put(`twitch/thumbnails/${userLogin}/${streamID}`, blob.stream(), {
        httpMetadata: {
            contentType: headers.get('Content-Type') || undefined,
            cacheControl: 'max-age=86400'
        }
    })
}