import {
  getCabinDetailPageData,
  getCabinsPageData,
} from "../facades/cabin.facade.js";

export const listPublicCabins = async (req, res) => {
  try {
    const pageData = await getCabinsPageData(req.query, req.currentUser);
    res.render("vwCabins/index", pageData);
  } catch (error) {
    console.error("Failed to list cabins:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

export const showCabinDetail = async (req, res) => {
  try {
    const detail = await getCabinDetailPageData(req.params.id, req.currentUser);
    if (!detail) return res.redirect("/cabins");

    res.render("vwCabins/detail", detail);
  } catch (error) {
    console.error("Failed to load cabin detail:", error.message);
    res.status(500).send("Internal Server Error");
  }
};
