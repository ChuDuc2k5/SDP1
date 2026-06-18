import db from "../dbHelper/db.js";

export default {
  findByCabinId(cabinId) {
    if (!cabinId) return null;
    return db("booking_policies").where("cabinId", cabinId).first();
  },
};
