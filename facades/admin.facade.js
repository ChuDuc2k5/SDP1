import * as cabinFacade from "./cabin.facade.js";
import * as settingFacade from "./setting.facade.js";

export const getCabinManagementPageData = async (
  currentUser,
  query = {},
) => {
  return cabinFacade.getCabinManagementPageData(currentUser, query);
};

export const getEditCabinPageData = async (currentUser, cabinId) => {
  const cabin = await cabinFacade.getCabinDetailPageData(cabinId, currentUser);
  return cabin ? { cabin: cabin.cabin } : null;
};

export const createCabin = async (currentUser, data) => {
  return cabinFacade.createCabin(currentUser, data);
};

export const updateCabin = async (currentUser, cabinId, data) => {
  return cabinFacade.updateCabin(currentUser, cabinId, data);
};

export const deleteCabin = async (currentUser, cabinId) => {
  return cabinFacade.deleteCabin(currentUser, cabinId);
};

export const duplicateCabin = async (currentUser, cabinId) => {
  return cabinFacade.duplicateCabin(currentUser, cabinId);
};

export const getSettingsPageData = async (currentUser) => {
  return settingFacade.getSettingsPageData(currentUser);
};

export const updateSettings = async (currentUser, data) => {
  return settingFacade.updateSettings(currentUser, data);
};

export const getAdminDashboardData = async (currentUser, query = {}) => {
  const [cabinManagement, settingsPage] = await Promise.all([
    getCabinManagementPageData(currentUser, query),
    getSettingsPageData(currentUser),
  ]);

  return {
    ...cabinManagement,
    ...settingsPage,
  };
};

export default {
  getCabinManagementPageData,
  getEditCabinPageData,
  createCabin,
  updateCabin,
  deleteCabin,
  duplicateCabin,
  getSettingsPageData,
  updateSettings,
  getAdminDashboardData,
};
