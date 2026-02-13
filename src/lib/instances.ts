export const REDLIB_INSTANCES = [
    "rl.bloat.cat",
    "redlib.tux.pizza",
    "redlib.ducks.party",
    "redlib.privadency.com",
    "redlib.catsarch.com",
    "redlib.r4fo.com",
    "red.ngn.tf"
];

export const NITTER_INSTANCES = [
    "twiiit.com",
    "nitter.net",
    "xcancel.com",
    "nitter.space",
    "nitter.poast.org"
];

export const INVIDIOUS_INSTANCES = [
    "redirect.invidious.io",
    "yewtu.be",
    "inv.nadeko.net",
    "invidious.nerdvpn.de"
];

import { fetchProxyContent } from "./proxy";

interface FetchOptions extends RequestInit {
    useProxyAsLastResort?: boolean;
    forceRefresh?: boolean;
}

/**
 * Tries multiple instances for a platform, falling back to a CORS proxy if all fail.
 */
export async function fetchWithInstanceFallback(
    path: string,
    instances: string[],
    options: FetchOptions = { useProxyAsLastResort: true }
): Promise<string> {
    // Shuffle instances to distribute load
    const shuffled = [...instances].sort(() => Math.random() - 0.5);

    for (const instance of shuffled) {
        try {
            const url = `https://${instance}${path.startsWith('/') ? '' : '/'}${path}`;
            console.log(`[Instances] Trying ${url}...`);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s per instance

            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                return await response.text();
            }
        } catch (error) {
            console.warn(`[Instances] ${instance} failed:`, error);
        }
    }

    if (options.useProxyAsLastResort) {
        // Just use the first (representative) instance for the proxy attempt
        // because the proxy handles it anyway, but we need a valid absolute URL.
        const defaultUrl = `https://${instances[0]}${path.startsWith('/') ? '' : '/'}${path}`;
        console.log(`[Instances] All instances failed, trying CORS proxy fallback via ${defaultUrl}`);
        return await fetchProxyContent(defaultUrl, options);
    }

    throw new Error(`All ${instances.length} instances failed and no proxy fallback was used.`);
}
