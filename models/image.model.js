import db from "../dbHelper/db.js";

export default {
  findByCabinId(cabinId) {
    if (!cabinId) return [];
    return db("images")
      .where("cabinId", cabinId)
      .orderBy("isCover", "desc")
      .orderBy("createdAt", "asc");
  },
};
