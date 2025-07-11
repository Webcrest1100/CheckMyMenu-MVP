// services/socialReviews.js
const axios = require("axios");
const CACHE_TTL = 1000 * 60 * 60; // 1 hour
const cache = {};

/**
 * Simple in-memory cache
 */
function getCached(key) {
  const rec = cache[key];
  if (rec && Date.now() - rec.ts < CACHE_TTL) return rec.val;
  return null;
}
function setCached(key, val) {
  cache[key] = { ts: Date.now(), val };
}

/**
 * 1) Google Place Reviews
 */
async function fetchGoogleReviews(placeId) {
  const key = `google:${placeId}`;
  const fromCache = getCached(key);
  if (fromCache) return fromCache;

  const resp = await axios.get(
    "https://maps.googleapis.com/maps/api/place/details/json",
    {
      params: {
        place_id: placeId,
        fields: "reviews",
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    }
  );
  const reviews = resp.data.result.reviews || [];
  setCached(key, reviews);
  return reviews;
}

/**
 * 2) Facebook Page Ratings
 *    requires a Page Access Token with "pages_read_user_content" & "pages_show_list"
 */
async function fetchFacebookReviews(pageId) {
  const key = `fb:${pageId}`;
  const fromCache = getCached(key);
  if (fromCache) return fromCache;

  const resp = await axios.get(
    `https://graph.facebook.com/v17.0/${pageId}/ratings`,
    {
      params: {
        access_token: process.env.FB_PAGE_ACCESS_TOKEN,
        fields: "reviewer{name,picture},rating,review_text,created_time",
      },
    }
  );
  const reviews = resp.data.data || [];
  setCached(key, reviews);
  return reviews;
}

/**
 * 3) Instagram comments on your latest media
 *    requires an Instagram Business Account linked to a Facebook Page,
 *    and an IG_ACCESS_TOKEN scoping "instagram_basic,instagram_manage_comments"
 */
async function fetchInstagramComments(igUserId) {
  const key = `ig:${igUserId}`;
  const fromCache = getCached(key);
  if (fromCache) return fromCache;

  // 1) fetch latest media IDs
  const mediaResp = await axios.get(
    `https://graph.instagram.com/${igUserId}/media`,
    {
      params: {
        access_token: process.env.IG_ACCESS_TOKEN,
        fields: "id,caption",
      },
    }
  );
  const media = mediaResp.data.data || [];
  // 2) for each of the most recent N posts, fetch comments
  const allComments = [];
  for (let m of media.slice(0, 3)) {
    const cResp = await axios.get(
      `https://graph.instagram.com/${m.id}/comments`,
      {
        params: {
          access_token: process.env.IG_ACCESS_TOKEN,
          fields: "username,text,timestamp",
        },
      }
    );
    (cResp.data.data || []).forEach((c) => {
      allComments.push({ postId: m.id, caption: m.caption, ...c });
    });
  }
  setCached(key, allComments);
  return allComments;
}

module.exports = {
  fetchGoogleReviews,
  fetchFacebookReviews,
  fetchInstagramComments,
};
