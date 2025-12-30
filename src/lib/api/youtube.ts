
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

export interface YouTubeVideo {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    channelTitle: string;
    publishedAt: string;
    position: number;
}

export interface YouTubePlaylist {
    id: string;
    title: string;
    description: string;
    author: string;
    itemCount: number;
    thumbnailUrl: string;
    videos: YouTubeVideo[];
}

export async function fetchPlaylistData(playlistUrlOrId: string, apiKey?: string): Promise<YouTubePlaylist | null> {
    if (!apiKey) {
        // Prefer server-side env var if not passed
        // Note: Client-side calls might fail if this is not exposed, so we should always proxy this via a server action
        console.error("API Key is required for YouTube Data");
        return null;
    }

    // Extract ID
    let playlistId = playlistUrlOrId;
    const urlMatch = playlistUrlOrId.match(/[?&]list=([^#\&\?]+)/);
    if (urlMatch) {
        playlistId = urlMatch[1];
    }

    try {
        // 1. Get Playlist Details
        const detailsUrl = new URL(`${YOUTUBE_API_BASE}/playlists`);
        detailsUrl.searchParams.append("part", "snippet,contentDetails");
        detailsUrl.searchParams.append("id", playlistId);
        detailsUrl.searchParams.append("key", apiKey);

        const detailsRes = await fetch(detailsUrl.toString());
        if (!detailsRes.ok) throw new Error(`Playlist fetch failed: ${detailsRes.statusText}`);

        const detailsData = await detailsRes.json();
        if (!detailsData.items || detailsData.items.length === 0) return null;

        const playlistInfo = detailsData.items[0].snippet;

        // 2. Get Playlist Items (Videos)
        const itemsUrl = new URL(`${YOUTUBE_API_BASE}/playlistItems`);
        itemsUrl.searchParams.append("part", "snippet");
        itemsUrl.searchParams.append("playlistId", playlistId);
        itemsUrl.searchParams.append("maxResults", "50"); // Fetch up to 50
        itemsUrl.searchParams.append("key", apiKey);

        const itemsRes = await fetch(itemsUrl.toString());
        if (!itemsRes.ok) throw new Error(`Items fetch failed: ${itemsRes.statusText}`);

        const itemsData = await itemsRes.json();

        const videos: YouTubeVideo[] = itemsData.items.map((item: any) => ({
            id: item.snippet.resourceId.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
            channelTitle: item.snippet.videoOwnerChannelTitle,
            publishedAt: item.snippet.publishedAt,
            position: item.snippet.position
        })).filter((v: YouTubeVideo) => v.title !== "Private video" && v.title !== "Deleted video");

        return {
            id: playlistId,
            title: playlistInfo.title,
            description: playlistInfo.description,
            author: playlistInfo.channelTitle,
            itemCount: videos.length,
            thumbnailUrl: playlistInfo.thumbnails?.high?.url || playlistInfo.thumbnails?.medium?.url,
            videos: videos
        };

    } catch (error) {
        console.error("YouTube Fetch Error:", error);
        return null;
    }
}
