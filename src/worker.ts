import { type IRequest, Router, withContent } from 'itty-router'
import { type RequestContent } from './content'
import type Env from './env'
import { fetchThumbnail, ThumbnailFetchError } from './imageFetch'
import { PUBLIC_BASE_URL, R2_KEY_PREFIX, storeAsset } from './r2'
import { prepareFallbackResponse } from './response'
import { getCachedResponse, prepareAndCacheResponseFromObject } from './cache'

const router = Router()

router.post<IRequest, any>('/stream-thumbnails/twitch', withContent, async (request: IRequest, env: Env, ctx: ExecutionContext) => {
	if (request.headers.get('Authorization') !== env.API_KEY)
		return new Response('unauthorized', { status: 401 })
	
	const body = request.content as RequestContent
	
	let blob: Blob
	let contentType: string
	try {
		[blob, contentType] = await fetchThumbnail(body.thumbnail_url)
	} catch (ex) {
		if (ex instanceof ThumbnailFetchError && ex.isSoft404)
			return Response.json(
				{ error: 'try again later' },
				{ status: 409 },
			)
		else
			return Response.json(
				{ error: 'failed to generate thumbnail' },
				{ status: 502 },
			)
	}

	const object = await storeAsset(env, body, blob, contentType)
	return Response.json(
		{ url: PUBLIC_BASE_URL + object.key },
		{ status: 201 },
	)
})

router.get('/stream-thumbnails/twitch/:userLogin/:slug', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
	const cachedResponse = await getCachedResponse(request)
	if (cachedResponse)
		return cachedResponse

	const userLogin = request.params.userLogin
	const slug = request.params.slug
	const key = `${R2_KEY_PREFIX}${userLogin}/${slug}`

	const object = await env.BUCKET.get(key)
	if (object?.body)
		return prepareAndCacheResponseFromObject(request, object, ctx)

	return prepareFallbackResponse(env)
})

router.get('/stream-thumbnails/twitch/404.png', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
	return prepareFallbackResponse(env)
})

router.all('*', (request: IRequest, env: Env, ctx: ExecutionContext) => {
	return new Response('not found', { status: 404 })
})

export default {
	fetch: router.handle
}
