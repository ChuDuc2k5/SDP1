import db from "../dbHelper/db.js";

const rateDao = {
  findByCabinId(cabinId) {
    return db("rates as r")
      .leftJoin("users as u", "r.userId", "u._id")
      .where("r.cabinId", cabinId)
      .select("r.*", "u.fullName as userFullName")
      .orderBy("r._id", "desc");
  },

  findByBookingId(bookingId) {
    if (!bookingId) return null;
    return db("rates").where("bookingId", bookingId).first();
  },

  findByUserId(userId) {
    return db("rates").where("userId", userId).orderBy("createdAt", "desc");
  },

  async create(data) {
    const inserted = await db("rates")
      .insert({
        userId: data.userId,
        cabinId: data.cabinId,
        bookingId: data.bookingId,
        rating: data.rating,
        comment: data.comment || null,
      })
      .returning("*");

    return inserted?.[0] || null;
  },
};

export const findByCabinId = rateDao.findByCabinId;
export const findByBookingId = rateDao.findByBookingId;
export const findByUserId = rateDao.findByUserId;
export const create = rateDao.create;

export default rateDao;
