# twitch-thumbnail-proxy

Cloudflare Worker that fetches Twitch stream thumbnails, stores them in R2, and serves them with caching.

## Endpoints

- `POST /stream-thumbnails/twitch` — fetches a thumbnail and stores it in R2. Requires an `Authorization` header matching `API_KEY`. Body: `{ stream_id, thumbnail_url, user_login }`. Returns `{ url }` on success.
- `GET /stream-thumbnails/twitch/:userLogin/:slug` — serves a stored thumbnail, cached at the edge. Falls back to a placeholder image if not found.
- `GET /stream-thumbnails/twitch/404.png` — serves the fallback placeholder image.

## Development

```bash
npm start    # run locally with wrangler dev
npm run deploy
```

## Config

Requires an `API_KEY` and a `BUCKET` (R2) binding, set in `wrangler.toml` / Cloudflare dashboard.
