const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/apiResponse");
const { getSettings } = require("../services/settingsService");

// Curated public subset: anything the frontend may need to render the header,
// footer, contact page, or compute shipping previews. Internal fields stay out.
const toPublicView = (s) => ({
  siteName: s.siteName,
  siteTagline: s.siteTagline,
  logoUrl: s.logoUrl,
  faviconUrl: s.faviconUrl,

  contactEmail: s.contactEmail,
  contactPhone: s.contactPhone,
  contactAddress: s.contactAddress,
  contactCity: s.contactCity,
  contactCountry: s.contactCountry,

  social: {
    facebook: s.facebookUrl,
    instagram: s.instagramUrl,
    whatsapp: s.whatsappNumber,
    tiktok: s.tiktokUrl,
    twitter: s.twitterUrl,
    youtube: s.youtubeUrl,
  },

  currency: s.currency,
  homeDeliveryCost: s.homeDeliveryCost,
  pickupDeliveryCost: s.pickupDeliveryCost,
});

const get = asyncHandler(async (_req, res) => {
  const settings = await getSettings();
  return success(res, 200, "Settings retrieved successfully", toPublicView(settings));
});

module.exports = { get };
