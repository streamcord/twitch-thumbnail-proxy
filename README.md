# twitch-thumbnail-proxy

Cloudflare Worker for proxying and caching Twitch thumbnails into R2

## How to use

Visit `/previews-ttv/:userLogin/:streamID` and the program will fetch the thumbnail from Twitch, and cache it into R2 if it's valid (i.e. doesn't redirect to a 404).

## Future functionality

In the future, a trusted client (like programs on a server) will be able to call an endpoint for the worker to cache the thumbnail. A static R2 URL could then be used to serve the image. This would require less requests to the worker.
