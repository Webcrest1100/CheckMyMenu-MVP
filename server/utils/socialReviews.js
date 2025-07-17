const axios = require("axios");

async function getFacebookReviews(pageId, pageToken) {
  if (!pageId || !pageToken) return [];
  try {
    const url = `https://graph.facebook.com/v16.0/${pageId}/ratings`;
    const { data } = await axios.get(url, {
      params: {
        access_token: pageToken,
        fields:        "review_text,created_time,reviewer{name}",
        limit:         5,
      },
      timeout: 8000
    });
    return (data.data || []).map(r => ({
      source: "facebook",
      author: r.reviewer?.name,
      text:   r.review_text,
      date:   new Date(r.created_time),
    }));
  } catch (e) {
    console.warn("Facebook reviews error:", e.response?.data || e.message);
    return [];
  }
}

async function getInstagramReviews(businessId, accessToken) {
  if (!businessId || !accessToken) return [];
  try {

    const mediaUrl = `https://graph.facebook.com/v16.0/${businessId}/media`;
    const mediaRes = await axios.get(mediaUrl, {
      params: { access_token: accessToken, fields: "id,timestamp", limit: 5 },
      timeout: 8000
    });
    const mediaItems = mediaRes.data.data || [];

    const comments = [];
    await Promise.all(mediaItems.map(async m => {
      try {
        const cmUrl = `https://graph.facebook.com/v16.0/${m.id}/comments`;
        const cmRes = await axios.get(cmUrl, {
          params: {
            access_token: accessToken,
            fields:       "username,text,timestamp",
            limit:        3,
          },
          timeout: 8000
        });
        (cmRes.data.data || []).forEach(c => {
          comments.push({
            source: "instagram",
            author: c.username,
            text:   c.text,
            date:   new Date(c.timestamp),
          });
        });
      } catch(_) { /* swallow per‐media errors */ }
    }));

    return comments;
  } catch (e) {
    console.warn("Instagram reviews error:", e.response?.data || e.message);
    return [];
  }
}

module.exports = { getFacebookReviews, getInstagramReviews };