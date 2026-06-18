import db from "../dbHelper/db.js";

const ACTIVE_STATUSES = ["unconfirmed", "pending", "confirmed", "checked-in"];

const selectWithCabin = () =>
  db("bookings as b")
    .join("cabins as c", "b.cabinId", "c._id")
    .select(
      "b.*",
      "c.name as cabinName",
      "c.image as cabinImage",
      "c.maxCapacity as cabinMaxCapacity",
      "c.regularPrice as cabinRegularPrice",
      "c.discount as cabinDiscount",
    );

const attachCabin = (row) =>
  row
    ? {
        ...row,
        userId: row.userId,
        cabinId: row.cabinId,
        cabin: {
          _id: row.cabinId,
          name: row.cabinName,
          image: row.cabinImage,
          maxCapacity: row.cabinMaxCapacity,
          regularPrice: row.cabinRegularPrice,
          discount: row.cabinDiscount,
        },
      }
    : null;

const attachCabins = (rows) => rows.map(attachCabin);

export default {
  findAll() {
    return selectWithCabin().orderBy("b.startDate", "desc").then(attachCabins);
  },

  findByUserId(userId) {
    if (!userId) {
      throw new Error("userId is required");
    }

    return selectWithCabin()
      .where("b.userId", userId)
      .orderBy("b.startDate", "desc")
      .then(attachCabins);
  },

  findById(id) {
    if (!id) return null;

    return selectWithCabin()
      .where("b._id", id)
      .first()
      .then(attachCabin);
  },

  async createBooking(bookingData) {
    const inserted = await db("bookings").insert(bookingData).returning("*");
    return inserted?.[0] || null;
  },

  async updateById(id, bookingData) {
    const updated = await db("bookings")
      .where("_id", id)
      .update({ ...bookingData, updatedAt: db.fn.now() })
      .returning("*");

    return updated?.[0] || null;
  },

  async hasOverlap({ cabinId, startDate, endDate, excludeBookingId = null }) {
    const query = db("bookings")
      .where("cabinId", cabinId)
      .whereIn("status", ACTIVE_STATUSES)
      .where("startDate", "<", endDate)
      .where("endDate", ">", startDate);

    if (excludeBookingId) {
      query.whereNot("_id", excludeBookingId);
    }

    const existing = await query.first("_id");
    return Boolean(existing);
  },

  create(type, bookingData) {
    return this.createBooking(bookingData);
  },

  update(id, bookingData) {
    return this.updateById(id, bookingData);
  },
};
