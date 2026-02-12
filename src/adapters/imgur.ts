import type { FeedAdapter, UnifiedPost } from "./types";
import { fetchProxyContent } from "../lib/proxy";

/**
 * Imgur-style adapter — aggregates viral/meme images.
 * Since Imgur's RSS feed is unreliable, we source from
 * meme and viral image subreddits.
 */
export class ImgurAdapter implements FeedAdapter {
    name = "Imgur";
    description = "Viral images, memes, and community content";

    private subreddits = "pics+aww+memes+funny+dankmemes+blursedimages";

    async fetchPosts(_topic?: string): Promise<UnifiedPost[]> {
        const jsonUrl = `https://www.reddit.com/r/${this.subreddits}/hot.json?limit=40&raw_json=1`;

        try {
            const rawContent = await fetchProxyContent(jsonUrl);
            const data = JSON.parse(rawContent);

            if (!data?.data?.children) return [];

            return data.data.children
                .filter((child: any) => {
                    const p = child.data;
                    return p.url_overridden_by_dest &&
                        (/\.(jpg|jpeg|png|gif|webp)/i.test(p.url_overridden_by_dest) ||
                            p.url_overridden_by_dest.includes('i.redd.it') ||
                            p.url_overridden_by_dest.includes('imgur.com'));
                })
                .slice(0, 40)
                .map((child: any) => {
                    const post = child.data;
                    let imageUrl = post.url_overridden_by_dest;
                    // Fix imgur gallery links to direct image
                    if (imageUrl.includes('imgur.com') && !imageUrl.match(/\.(jpg|png|gif|webp)/i)) {
                        imageUrl = imageUrl + '.jpg';
                    }

                    return {
                        id: `img-${post.id}`,
                        source: 'imgur' as const,
                        author: {
                            name: post.author || "Unknown",
                            handle: `u/${post.author} · r/${post.subreddit}`,
                            avatar: `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${post.author || post.subreddit}`,
                            url: `https://www.reddit.com/u/${post.author}`,
                        },
                        content: `<strong>${post.title}</strong>`,
                        media: [{
                            type: 'image' as const,
                            url: imageUrl,
                            previewUrl: imageUrl,
                        }],
                        url: `https://www.reddit.com${post.permalink}`,
                        timestamp: (post.created_utc || 0) * 1000,
                        originalData: post,
                    };
                });
        } catch (e) {
            console.error("Imgur adapter error:", e);
            throw e;
        }
    }
}
