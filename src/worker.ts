import { IRequest, Router, withContent } from 'itty-router'
import Env from './env'
import { prepareFallbackResponse, prepareResponseFromObject } from './response'
import { fetchThumbnail } from './imageFetch'
import { RequestContent } from './content'
import { PUBLIC_BASE_URL, R2_KEY_PREFIX, storeAsset } from './r2'

const router = Router()

router.post<IRequest, any>('/stream-thumbnails/twitch', withContent, async (request: IRequest, env: Env, ctx: ExecutionContext) => {
	if (request.headers.get('Authorization') != env.API_KEY) {
		return new Response('unauthorized', { status: 401 })
	}
	
	const body = request.content as RequestContent
	
	const [blob, contentType] = await fetchThumbnail(body.thumbnail_url)
	if (!blob || !contentType) {
		// TODO: if met with a soft 404, somehow generate the thumbnail later
		return Response.json({'error': 'failed to generate thumbnail'}, { status: 500 })
	}

	const object = await storeAsset(env, body, blob, contentType)
	return Response.json({
		url: PUBLIC_BASE_URL + object.key
	}, { status: 201 })
})

router.get('/stream-thumbnails/twitch/:userLogin/:slug',async (request: IRequest, env: Env, ctx: ExecutionContext) => {
	const userLogin = request.params.userLogin
	const slug = request.params.slug

	const key = R2_KEY_PREFIX + userLogin + '/' + slug

	const object = await env.BUCKET.get(key)
	if (object?.body) {
		return prepareResponseFromObject(object)
	}

	return prepareFallbackResponse(env)
})

router.all('*', (request: IRequest, env: Env, ctx: ExecutionContext) => {
	return new Response('not found', { status: 404 })
})

export default {
	fetch: router.handle
}
