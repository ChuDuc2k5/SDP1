import db from "../dbHelper/db.js";

const rateDao = {
  findById(id) {
    if (!id) return null;
    return db("rates").where("_id", id).first();
  },

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

<<<<<<< Updated upstream
  findSummariesByCabinIds(cabinIds) {
    if (!Array.isArray(cabinIds) || cabinIds.length === 0) return [];

    return db("rates")
      .whereIn("cabinId", cabinIds)
      .select("cabinId")
      .avg({ avgRating: "rating" })
      .count({ reviewCount: "_id" })
=======
  findSummariesByCabinIds(cabinIds = []) {
    const uniqueCabinIds = [...new Set(cabinIds.filter(Boolean))];
    if (uniqueCabinIds.length === 0) return [];

    return db("rates")
      .whereIn("cabinId", uniqueCabinIds)
      .select("cabinId")
      .avg({ avgRating: "rating" })
      .count({ reviewCount: "*" })
>>>>>>> Stashed changes
      .groupBy("cabinId");
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

  async updateById(id, data) {
    const updated = await db("rates")
      .where("_id", id)
      .update({
        rating: data.rating,
        comment: data.comment,
        updatedAt: db.fn.now(),
      })
      .returning("*");

    return updated?.[0] || null;
  },

  async deleteById(id) {
    const deleted = await db("rates")
      .where("_id", id)
      .del()
      .returning("*");

    return deleted?.[0] || null;
  },
};

export const findById = rateDao.findById;
export const findByCabinId = rateDao.findByCabinId;
export const findByBookingId = rateDao.findByBookingId;
export const findByUserId = rateDao.findByUserId;
export const findSummariesByCabinIds = rateDao.findSummariesByCabinIds;
export const create = rateDao.create;
export const updateById = rateDao.updateById;
export const deleteById = rateDao.deleteById;

export default rateDao;
