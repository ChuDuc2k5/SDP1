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

  async update(id, data) {
    const updated = await db("rates")
      .where("_id", id)
      .update({
        rating: data.rating,
        comment: data.comment || null,
        updatedAt: db.fn.now(),
      })
      .returning("*");

    return updated?.[0] || null;
  },

  delete(id) {
    return db("rates").where("_id", id).del();
  },
};

export const findById = rateDao.findById;
export const findByCabinId = rateDao.findByCabinId;
export const findByBookingId = rateDao.findByBookingId;
export const findByUserId = rateDao.findByUserId;
export const create = rateDao.create;
export const update = rateDao.update;
export const deleteRate = rateDao.delete;
export { deleteRate as delete };

export default rateDao;
