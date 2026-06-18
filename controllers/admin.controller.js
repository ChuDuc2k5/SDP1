import {
  createCabin,
  deleteCabin,
  duplicateCabin,
  getCabinById,
  listManageCabins,
  updateCabin,
} from "../services/cabin.service.js";
import {
  getCurrentSettings,
  updateCurrentSettings,
} from "../services/settings.service.js";

export const listCabins = async (req, res) => {
  try {
    const cabins = await listManageCabins();
    res.render("vwAdmin/manage-cabin", { cabins });
  } catch (err) {
    console.error("Failed to load cabins:", err.message);
    res.render("vwAdmin/manage-cabin", {
      cabins: [],
      error: "Cannot load cabin list",
    });
  }
};

export const renderCreateCabin = (req, res) => {
  res.render("vwAdmin/create-cabin", {});
};

export const storeCabin = async (req, res) => {
  try {
    await createCabin({ body: req.body, file: req.file });
    res.redirect("/admin/cabins");
  } catch (err) {
    console.error("Failed to create cabin:", err.message);
    res.redirect("/admin/cabins");
  }
};

export const renderEditCabin = async (req, res) => {
  try {
    const cabin = await getCabinById(req.params.id);
    if (!cabin) return res.redirect("/admin/cabins");

    res.render("vwAdmin/edit-cabin", { cabin });
  } catch (err) {
    console.error("Failed to load cabin:", err.message);
    res.redirect("/admin/cabins");
  }
};

export const saveCabin = async (req, res) => {
  try {
    const cabin = await updateCabin({
      id: req.params.id,
      body: req.body,
      file: req.file,
    });

    if (!cabin) {
      return res.redirect("/admin/cabins");
    }

    res.redirect("/admin/cabins");
  } catch (err) {
    console.error("Failed to update cabin:", err.message);
    res.redirect("/admin/cabins");
  }
};

export const removeCabin = async (req, res) => {
  try {
    await deleteCabin(req.params.id);
    res.redirect("/admin/cabins");
  } catch (err) {
    console.error("Failed to delete cabin:", err.message);
    res.redirect("/admin/cabins");
  }
};

export const cloneCabin = async (req, res) => {
  try {
    const duplicatedCabin = await duplicateCabin(req.params.id);
    if (!duplicatedCabin) {
      return res.redirect("/admin/cabins");
    }

    res.redirect(`/admin/cabins/edit/${duplicatedCabin._id}`);
  } catch (err) {
    console.error("Failed to duplicate cabin:", err.message);
    res.redirect("/admin/cabins");
  }
};

export const renderSettings = async (req, res) => {
  try {
    const settings = await getCurrentSettings();
    res.render("vwAdmin/settings", { settings });
  } catch (err) {
    console.error("Failed to load settings:", err.message);
    res.render("vwAdmin/settings", {
      settings: null,
      error: true,
    });
  }
};

export const saveSettings = async (req, res) => {
  try {
    const settings = await updateCurrentSettings(req.body);

    res.render("vwAdmin/settings", {
      settings,
      success: true,
    });
  } catch (err) {
    console.error("Failed to update settings:", err.message);

    res.render("vwAdmin/settings", {
      settings: {
        breakfastPrice: Number(req.body.breakfastPrice) || 15,
        miniBookingLength: Number(req.body.minBookingLength) || 1,
        maxBookingLength: Number(req.body.maxBookingLength) || 30,
        maxNumberOfGuests: Number(req.body.maxGuests) || 10,
      },
      error: true,
    });
  }
};

export const renderOrders = (req, res) => {
  res.render("vwAdmin/manage-orders", {});
};
