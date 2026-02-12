import type { FeedAdapter, UnifiedPost } from "./types";
import { fetchProxyContent } from "../lib/proxy";

/**
 * Pixelfed-style adapter — aggregates from photo-focused communities.
 * Since Pixelfed instances require auth for their API, we use
 * Reddit's photo-centric subreddits as an alternative photo feed.
 */
export class PixelfedAdapter implements FeedAdapter {
    name = "Pixelfed";
    description = "Photography & visual art — curated from photo communities";

    private subreddits = "EarthPorn+CityPorn+itookapicture+photocritique+photographs";

    async fetchPosts(_topic?: string): Promise<UnifiedPost[]> {
        const jsonUrl = `https://www.reddit.com/r/${this.subreddits}/hot.json?limit=40&raw_json=1`;

        try {
            const rawContent = await fetchProxyContent(jsonUrl);
            const data = JSON.parse(rawContent);

            if (!data?.data?.children) return [];

            return data.data.children
                .filter((child: any) => {
                    const p = child.data;
                    // Only include posts with actual images
                    return p.url_overridden_by_dest &&
                        /\.(jpg|jpeg|png|gif|webp)/i.test(p.url_overridden_by_dest);
                })
                .slice(0, 40)
                .map((child: any) => {
                    const post = child.data;
                    return {
                        id: `pxf-${post.id}`,
                        source: 'pixelfed' as const,
                        author: {
                            name: post.author || "Photographer",
                            handle: `u/${post.author} · r/${post.subreddit}`,
                            avatar: `https://api.dicebear.com/7.x/shapes/svg?seed=${post.author || post.subreddit}`,
                            url: `https://www.reddit.com/u/${post.author}`,
                        },
                        content: `<strong>${post.title}</strong>`,
                        media: [{
                            type: 'image' as const,
                            url: post.url_overridden_by_dest,
                            previewUrl: post.url_overridden_by_dest,
                        }],
                        url: `https://www.reddit.com${post.permalink}`,
                        timestamp: (post.created_utc || 0) * 1000,
                        originalData: post,
                    };
                });
        } catch (e) {
            console.error("Pixelfed adapter error:", e);
            throw e;
        }
    }
}
