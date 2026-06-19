import db from "../dbHelper/db.js";

const bookingPolicyDao = {
  findByCabinId(cabinId) {
    if (!cabinId) return null;
    return db("booking_policies").where("cabinId", cabinId).first();
  },
};

export const findByCabinId = bookingPolicyDao.findByCabinId;

export default bookingPolicyDao;
