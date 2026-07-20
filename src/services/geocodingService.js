const NodeGeocoder = require("node-geocoder");

// OpenStreetMap / Nominatim: free, no API key. Its usage policy requires a
// descriptive User-Agent (and an optional contact email) identifying the app.
const geocoder = NodeGeocoder({
  provider: "openstreetmap",
  language: "fr",
  email: process.env.GEOCODER_EMAIL || undefined,
  headers: {
    "user-agent":
      process.env.GEOCODER_USER_AGENT ||
      "BuurElec-Ecommerce/1.0 (+https://buurelec.com)",
    accept: "application/json;q=0.9, */*;q=0.1",
  },
});

const DEFAULT_COUNTRY = "Sénégal";

/**
 * Reverse-geocode GPS coordinates into a normalized shipping address.
 *
 * Always returns every field the Address model requires, applying sensible
 * fallbacks when Nominatim omits a component (common in Senegal, e.g. no
 * postcode / no street name for informal areas).
 *
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<{street:string, city:string, state:string|null,
 *   zipCode:string, country:string, formattedAddress:string|null}>}
 */
const reverseGeocodeToAddress = async (latitude, longitude) => {
  let result;
  try {
    const results = await geocoder.reverse({ lat: latitude, lon: longitude });
    result = Array.isArray(results) ? results[0] : results;
  } catch (err) {
    console.error("Reverse geocoding failed:", err);
    const e = new Error(
      "Impossible de déterminer votre position. Veuillez saisir votre adresse manuellement.",
    );
    e.statusCode = 502;
    throw e;
  }

  if (!result) {
    const e = new Error(
      "Aucune adresse trouvée pour la position fournie. Veuillez saisir votre adresse manuellement.",
    );
    e.statusCode = 422;
    throw e;
  }

  const street =
    [result.streetNumber, result.streetName].filter(Boolean).join(" ") ||
    result.neighbourhood ||
    result.formattedAddress ||
    `Position GPS (${latitude}, ${longitude})`;

  const city = result.city || result.state || "Non précisée";

  return {
    street,
    city,
    state: result.state || null,
    // Nominatim frequently returns no postcode in Senegal.
    zipCode: result.zipcode || "00000",
    country: result.country || DEFAULT_COUNTRY,
    formattedAddress: result.formattedAddress || null,
  };
};

module.exports = { reverseGeocodeToAddress };
