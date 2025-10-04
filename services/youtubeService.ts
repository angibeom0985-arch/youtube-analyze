
export interface VideoDetails {
  title: string;
  thumbnailUrl: string;
}

export const getVideoDetails = async (url: string): Promise<VideoDetails> => {
  // YouTube's oEmbed endpoint is public and can be used for this.
  // It doesn't require an API key for basic info like title and thumbnail.
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;

  try {
    const response = await fetch(oembedUrl);
    
    if (!response.ok) {
      // This could be because the video is private, deleted, or the URL is wrong.
      throw new Error(`Failed to fetch video details: ${response.statusText}`);
    }
    
    const data = await response.json();

    if (!data.title || !data.thumbnail_url) {
        throw new Error("Video details from oEmbed endpoint are incomplete.");
    }

    return {
      title: data.title,
      thumbnailUrl: data.thumbnail_url,
    };
  } catch (error) {
    console.error("Error fetching YouTube video details:", error);
    throw new Error("Could not fetch video details.");
  }
};
