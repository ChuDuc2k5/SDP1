import * as cabinFacade from "./cabin.facade.js";
import * as settingFacade from "./setting.facade.js";

export const getCabinOwnerDashboardData = async (
  currentUser,
  query = {},
) => {
  const [cabinManagement, settingsPage] = await Promise.all([
    getCabinManagementData(currentUser, query),
    getOwnerSettingsPageData(currentUser),
  ]);

  return {
    ...cabinManagement,
    ...settingsPage,
  };
};

export const getCabinManagementData = async (currentUser, query = {}) => {
  return cabinFacade.getCabinManagementPageData(currentUser, query);
};

export const getCabinCreatePageData = async () => ({});

export const getCabinEditPageData = async (currentUser, cabinId) => {
  const cabin = await cabinFacade.getCabinDetailPageData(cabinId, currentUser);
  return cabin ? { cabin: cabin.cabin } : null;
};

export const createCabinForOwner = async (currentUser, data) => {
  return cabinFacade.createCabin(currentUser, data);
};

export const updateCabinForOwner = async (currentUser, cabinId, data) => {
  return cabinFacade.updateCabin(currentUser, cabinId, data);
};

export const deleteCabinForOwner = async (currentUser, cabinId) => {
  return cabinFacade.deleteCabin(currentUser, cabinId);
};

export const duplicateCabinForOwner = async (currentUser, cabinId) => {
  return cabinFacade.duplicateCabin(currentUser, cabinId);
};

export const getOwnerSettingsPageData = async (currentUser) => {
  return settingFacade.getSettingsPageData(currentUser);
};

export const updateOwnerSettings = async (currentUser, data) => {
  return settingFacade.updateSettings(currentUser, data);
};

export default {
  getCabinOwnerDashboardData,
  getCabinManagementData,
  getCabinCreatePageData,
  getCabinEditPageData,
  createCabinForOwner,
  updateCabinForOwner,
  deleteCabinForOwner,
  duplicateCabinForOwner,
  getOwnerSettingsPageData,
  updateOwnerSettings,
};
