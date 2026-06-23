const asyncHandler = require("../../utils/asyncHandler");
const { success } = require("../../utils/apiResponse");
const { getSettings, updateSettings } = require("../../services/settingsService");

const get = asyncHandler(async (_req, res) => {
  const settings = await getSettings();
  return success(res, 200, "Settings retrieved successfully", settings);
});

const update = asyncHandler(async (req, res) => {
  const settings = await updateSettings(req.body);
  return success(res, 200, "Settings updated successfully", settings);
});

module.exports = { get, update };
