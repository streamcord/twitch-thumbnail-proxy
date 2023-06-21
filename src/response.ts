import Env from './env'

export function prepareResponseFromObject(object: R2ObjectBody): Response {
    const headers = new Headers()
	object.writeHttpMetadata(headers)
	headers.set('etag', object.httpEtag)
    headers.set('x-cache', 'HIT')

	return new Response(object.body, { headers })
}

export async function prepareFallbackResponse(env: Env): Promise<Response> {
	const object = await env.BUCKET.get('thumbnail_fallback.png')
	if (object?.body) {
		const headers = new Headers()
		object.writeHttpMetadata(headers)
		headers.set('cache-control', 'no-cache')
		headers.set('etag', object.httpEtag)
		headers.set('x-cache', 'MISS')

		return new Response(object.body, { headers })
	}
	return new Response('could not generate a thumbnail, and could not find the fallback thumbnail file', { status: 500 })
}
