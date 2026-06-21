import db from "../dbHelper/db.js";

const bookingPolicyDao = {
  findByCabinId(cabinId) {
    if (!cabinId) return null;
    return db("booking_policies").where("cabinId", cabinId).first();
  },

  async create(data) {
    const inserted = await db("booking_policies")
      .insert({
        cabinId: data.cabinId,
        breakfastPrice: data.breakfastPrice,
        miniBookingLength: data.miniBookingLength,
        maxBookingLength: data.maxBookingLength,
      })
      .returning("*");

    return inserted?.[0] || null;
  },

  async updateByCabinId(cabinId, data) {
    const updated = await db("booking_policies")
      .where("cabinId", cabinId)
      .update({
        breakfastPrice: data.breakfastPrice,
        miniBookingLength: data.miniBookingLength,
        maxBookingLength: data.maxBookingLength,
        updatedAt: db.fn.now(),
      })
      .returning("*");

    return updated?.[0] || null;
  },

  deleteByCabinId(cabinId) {
    return db("booking_policies").where("cabinId", cabinId).del();
  },
};

export const findByCabinId = bookingPolicyDao.findByCabinId;
export const create = bookingPolicyDao.create;
export const updateByCabinId = bookingPolicyDao.updateByCabinId;
export const deleteByCabinId = bookingPolicyDao.deleteByCabinId;

export default bookingPolicyDao;
