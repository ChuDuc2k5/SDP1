import { getCabinDetail, listCabins } from "../services/cabin.service.js";

export const listPublicCabins = async (req, res) => {
  try {
    const sortType = req.query.sort || "default";
    const cabins = await listCabins(sortType);

    res.render("vwCabins/index", {
      cabins,
      empty: cabins.length === 0,
      activeSort: sortType,
    });
  } catch (error) {
    console.error("Failed to list cabins:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

export const showCabinDetail = async (req, res) => {
  try {
    const detail = await getCabinDetail(req.params.id);
    if (!detail) return res.redirect("/cabins");

    res.render("vwCabins/detail", detail);
  } catch (error) {
    console.error("Failed to load cabin detail:", error.message);
    res.status(500).send("Internal Server Error");
  }
};
