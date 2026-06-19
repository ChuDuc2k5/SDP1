import db from "../dbHelper/db.js";

const imageDao = {
  findByCabinId(cabinId) {
    if (!cabinId) return [];

    return db("images")
      .where("cabinId", cabinId)
      .orderBy("isCover", "desc")
      .orderBy("createdAt", "asc");
  },
};

export const findByCabinId = imageDao.findByCabinId;

export default imageDao;
