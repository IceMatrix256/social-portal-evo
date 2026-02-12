export function getProxyUrl(targetUrl: string): string {
    // Misskey instances usually support CORS, and our proxy gets blocked by Cloudflare (403)
    if (targetUrl.includes('misskey.io') || targetUrl.includes('misskey.design')) {
        return targetUrl;
    }

    // In Development, we use Vite's proxy (configured in vite.config.ts)
    // to route /api/* requests to our local server.py (which handles the actual external fetching).
    if (import.meta.env.DEV) {
        if (targetUrl.includes('reddit.com')) {
            return targetUrl.replace(/^https?:\/\/(www\.)?reddit\.com/, '/api/reddit');
        }
        if (targetUrl.includes('mastodon.social')) {
            return targetUrl.replace(/^https?:\/\/(www\.)?mastodon\.social/, '/api/mastodon');
        }
        if (targetUrl.includes('api.nostr.band')) {
            return targetUrl.replace(/^https?:\/\/api\.nostr\.band/, '/api/nostr');
        }
        if (targetUrl.includes('lemmy.world')) {
            return targetUrl.replace(/^https?:\/\/(www\.)?lemmy\.world/, '/api/lemmy');
        }
        if (targetUrl.includes('public.api.bsky.app')) {
            return targetUrl.replace(/^https?:\/\/public\.api\.bsky\.app/, '/api/bluesky');
        }
        if (targetUrl.includes('misskey.io')) {
            return targetUrl.replace(/^https?:\/\/misskey\.io/, '/api/misskey');
        }
        if (targetUrl.includes('misskey.design')) {
            return targetUrl.replace(/^https?:\/\/misskey\.design/, '/api/misskey-design');
        }
        if (targetUrl.includes('piefed.social')) {
            return targetUrl.replace(/^https?:\/\/piefed\.social/, '/api/custom-feed');
        }
    }

    // In Production (or unexpected envs), fall back to public proxy or relative path
    return `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
}

export async function fetchProxyContent(targetUrl: string, options?: RequestInit): Promise<string> {
    const url = getProxyUrl(targetUrl);
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    if (url.includes('allorigins.win')) {
        const wrapper = await response.json();
        return wrapper.contents;
    } else {
        return await response.text();
    }
}
