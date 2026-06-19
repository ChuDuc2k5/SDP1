import {
  createCabin,
  deleteCabin,
  duplicateCabin,
  getCabinById,
  listManageCabins,
  updateCabin,
} from "./cabin.service.js";
import {
  getCurrentSettings,
  updateCurrentSettings,
} from "./settings.service.js";

export const getManageCabinsPageData = async () => ({
  cabins: await listManageCabins(),
});

export const getEditCabinPageData = async (id) => {
  const cabin = await getCabinById(id);
  return cabin ? { cabin } : null;
};

export const createAdminCabin = createCabin;

export const updateAdminCabin = updateCabin;

export const deleteAdminCabin = deleteCabin;

export const duplicateAdminCabin = duplicateCabin;

export const getSettingsPageData = async () => ({
  settings: await getCurrentSettings(),
});

export const updateSettingsPageData = async (payload) => ({
  settings: await updateCurrentSettings(payload),
  success: true,
});

export default {
  getManageCabinsPageData,
  getEditCabinPageData,
  createAdminCabin,
  updateAdminCabin,
  deleteAdminCabin,
  duplicateAdminCabin,
  getSettingsPageData,
  updateSettingsPageData,
};
