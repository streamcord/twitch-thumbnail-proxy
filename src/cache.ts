import { IRequest } from 'itty-router'
import { prepareResponseFromObject } from './response'

/**
 * Prepares a response from an `R2ObjectBody` and stores it into Cloudflare's cache.
 * @param cacheKey The request info used for caching.
 * @param object The `R2ObjectBody`.
 * @param ctx The execution context.
 * @returns The prepared `Response`.
 */
export async function prepareAndCacheResponseFromObject(cacheKey: IRequest, object: R2ObjectBody, ctx: ExecutionContext) {
    const response = prepareResponseFromObject(object)

    ctx.waitUntil(
        caches.default.put(cacheKey, response.clone())
    )
    
    response.headers.set('x-cache', 'MISS')
    return response
}

/**
 * Attempt to match this request to a cache entry.
 * @param cacheKey The request info used for caching.
 * @returns The matching `Response`, if any, else `undefined` if no cache entry exists.
 */
export async function getCachedResponse(cacheKey: IRequest): Promise<Response | undefined> {
    let response = await caches.default.match(cacheKey)
    if (response) {
        response = new Response(
            response.body,
            {
                headers: {
                    ...response.headers,
                    'x-cache': 'HIT'
                }
            }
        )
    }
    return response
}
