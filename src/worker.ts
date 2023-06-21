import { IRequest, Router } from 'itty-router'
import Env from './env'
import { prepareResponseFromObject } from './response'
import { respondUncachedThumbnail } from './imageFetch'

const router = Router()

router.get('/previews-ttv/:userLogin/:streamID', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
	const userLogin = request.params.userLogin
	const streamID = request.params.streamID
	const r2Key = `twitch/thumbnails/${userLogin}/${streamID}`
	
	const object = await env.BUCKET.get(r2Key)
	if (object?.body) {
		return prepareResponseFromObject(object)
	}

	try {
		return respondUncachedThumbnail(env, userLogin, streamID)
	} catch (err) {
		console.error(err)
		return new Response('internal server error', { status: 500 })
	}
})

router.all('*', (request: IRequest, env: Env, ctx: ExecutionContext) => {
	return new Response('not found', { status: 404 })
})

export default {
	fetch: router.handle
}
