 // services/socialReviews.js
const axios = require("axios");
const CACHE_TTL = 1000 * 60 * 60;
const cache = {};

function getCached(key) {
  const rec = cache[key];
  if (rec && Date.now() - rec.ts < CACHE_TTL) return rec.val;
  return null;
}
function setCached(key, val) {
  cache[key] = { ts: Date.now(), val };
}

async function fetchGoogleReviews(placeId) {
  const key = `google:${placeId}`;
  const fromCache = getCached(key);
  if (fromCache) return fromCache;

  const resp = await axios.get("https://maps.googleapis.com/maps/api/place/details/json", {
    params: {
      place_id: placeId,
      fields:    "reviews",
      key:       process.env.GOOGLE_MAPS_API_KEY,
    }
  });

  const reviews = resp.data.result?.reviews || [];
  setCached(key, reviews);
  return reviews;
}

module.exports = { fetchGoogleReviews };
