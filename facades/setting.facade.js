import * as settingService from "../services/setting.service.js";

export const getSettingsPageData = async (currentUser = null) => ({
  settings: await settingService.getCurrentSettings(currentUser),
});

export const updateSettings = async (currentUser = null, data = {}) => ({
  settings: await settingService.updateCurrentSettings(data, currentUser),
  success: true,
});

export default {
  getSettingsPageData,
  updateSettings,
};
