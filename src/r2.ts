import { RequestContent } from './content'
import Env from './env'

export const PUBLIC_BASE_URL = 'https://edge-assets.api.streamcord.io/'
export const R2_KEY_PREFIX = 'stream-thumbnails/twitch/'

function getFileExtension(url: string): string {
    const split = url.split('.')
    return split[split.length - 1]
}

function encodeSlug(slug: string): string {
    return btoa(slug)
        .replace(/\+/g, '-') // Convert '+' to '-'
        .replace(/\//g, '_') // Convert '/' to '_'
        .replace(/=+$/, ''); // Remove ending '='
}

/**
 * Generates a key name for an asset, given the Twitch user's login, stream ID, and current time.
 * 
 * @param user_login Twitch user's login.
 * @param stream_id Twitch stream ID.
 * @returns A (hopefully) unique key name.
 */
function generateR2Key(content: RequestContent): string {
    const slug = content.stream_id + '/' + Date.now().toString()
    return R2_KEY_PREFIX + content.user_login + '/' + encodeSlug(slug) + '.' + getFileExtension(content.thumbnail_url)
}

/**
 * Store data to R2.
 * 
 * @param env The environment containing an `R2Bucket`.
 * @param content The request body.
 * @param blob The asset data to upload.
 * @param contentType The asset's data type.
 * @returns The resulting `R2Object`.
 */
export async function storeAsset(env: Env, content: RequestContent, blob: Blob, contentType: string) {
    return await env.BUCKET.put(
        generateR2Key(content),
        blob.stream(),
        {
            httpMetadata: {
                contentType,
                cacheControl: 'max-age=86400'
            }
        }
    )
}
