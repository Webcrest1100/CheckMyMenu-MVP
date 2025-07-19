// utils/googleReviews.js
const { Client } = require("@googlemaps/google-maps-services-js");
const client = new Client({});

const CACHE_TTL = 1000 * 60 * 60; // 1h
const cache = {};

function getCached(key) {
  const rec = cache[key];
  if (rec && Date.now() - rec.ts < CACHE_TTL) return rec.val;
  return null;
}
function setCached(key, val) {
  cache[key] = { ts: Date.now(), val };
}

/**
 * Fetch up to 5 Google Place reviews.
 * Requires process.env.GOOGLE_MAPS_API_KEY to be set.
 */
async function fetchGoogleReviews(placeId) {
  const key = `google:${placeId}`;
  const fromCache = getCached(key);
  if (fromCache) return fromCache;

  const resp = await client.placeDetails({
    params: {
      place_id: placeId,
      key:      process.env.GOOGLE_MAPS_API_KEY,
      fields:   ["reviews"]
    }
  });

  const reviews = (resp.data.result.reviews || [])
    .slice(0,5)
    .map(r => ({
      source: "google",
      author: r.author_name,
      text:   r.text,
      rating: r.rating,
      date:   new Date(r.time * 1000),
    }));

  setCached(key, reviews);
  return reviews;
}

module.exports = { fetchGoogleReviews };
