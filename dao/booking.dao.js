import db from "../dbHelper/db.js";

const ACTIVE_STATUSES = ["unconfirmed", "pending", "confirmed", "checked-in"];
const HISTORY_STATUSES = ["cancelled", "checked-out"];
const FILTERABLE_STATUSES = [
  "unconfirmed",
  "confirmed",
  "checked-in",
  "checked-out",
  "cancelled",
  "pending",
];

const selectWithCabin = () =>
  db("bookings as b")
    .join("cabins as c", "b.cabinId", "c._id")
    .join("users as u", "b.userId", "u._id")
    .select(
      "b.*",
      "c.name as cabinName",
      "c.image as cabinImage",
      "c.maxCapacity as cabinMaxCapacity",
      "c.regularPrice as cabinRegularPrice",
      "c.discount as cabinDiscount",
      "u.fullName as guestName",
      "u.email as guestEmail",
      "u.phone as guestPhone",
    );

const countWithDetails = () =>
  db("bookings as b")
    .join("cabins as c", "b.cabinId", "c._id")
    .join("users as u", "b.userId", "u._id");

const applyUpcomingScope = (query) =>
  query
    .whereNotIn("b.status", HISTORY_STATUSES)
    .where("b.endDate", ">=", db.raw("CURRENT_DATE"));

const applyHistoryScope = (query) =>
  query.where((builder) => {
    builder
      .whereIn("b.status", HISTORY_STATUSES)
      .orWhere("b.endDate", "<", db.raw("CURRENT_DATE"));
  });

const applyOwnerFilters = (query, filters = {}) => {
  const q = String(filters.q || "").trim().toLowerCase();
  if (q) {
    const search = `%${q}%`;
    query.where((builder) => {
      builder
        .whereRaw('LOWER(COALESCE(u."fullName", \'\')) LIKE ?', [search])
        .orWhereRaw("LOWER(COALESCE(u.email, '')) LIKE ?", [search])
        .orWhereRaw("LOWER(COALESCE(u.phone, '')) LIKE ?", [search])
        .orWhereRaw("LOWER(COALESCE(c.name, '')) LIKE ?", [search]);
    });
  }

  if (FILTERABLE_STATUSES.includes(filters.status)) {
    query.where("b.status", filters.status);
  }

  if (filters.dateFrom) {
    query.where("b.startDate", ">=", filters.dateFrom);
  }

  if (filters.dateTo) {
    query.where("b.endDate", "<=", filters.dateTo);
  }

  return query;
};

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
        guest: {
          name: row.guestName,
          email: row.guestEmail,
          phone: row.guestPhone,
        },
      }
    : null;

const attachCabins = (rows = []) => rows.map(attachCabin);

const bookingDao = {
  findAll() {
    return selectWithCabin().orderBy("b.startDate", "desc").then(attachCabins);
  },

  findAllPaginated(limit, offset) {
    return selectWithCabin()
      .orderBy("b.startDate", "desc")
      .limit(limit)
      .offset(offset)
      .then(attachCabins);
  },

  countAll() {
    return db("bookings as b").count({ total: "*" }).first();
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

  findByUserIdPaginated(userId, limit, offset) {
    if (!userId) {
      throw new Error("userId is required");
    }

    return selectWithCabin()
      .where("b.userId", userId)
      .orderBy("b.startDate", "desc")
      .limit(limit)
      .offset(offset)
      .then(attachCabins);
  },

  countByUserId(userId) {
    if (!userId) {
      throw new Error("userId is required");
    }

    return db("bookings as b")
      .where("b.userId", userId)
      .count({ total: "*" })
      .first();
  },

  findUpcomingByUserIdPaginated(userId, limit, offset) {
    if (!userId) {
      throw new Error("userId is required");
    }

    const query = selectWithCabin().where("b.userId", userId);
    return applyUpcomingScope(query)
      .orderBy("b.startDate", "asc")
      .limit(limit)
      .offset(offset)
      .then(attachCabins);
  },

  countUpcomingByUserId(userId) {
    if (!userId) {
      throw new Error("userId is required");
    }

    const query = countWithDetails().where("b.userId", userId);
    return applyUpcomingScope(query).count({ total: "*" }).first();
  },

  findHistoryByUserIdPaginated(userId, limit, offset) {
    if (!userId) {
      throw new Error("userId is required");
    }

    const query = selectWithCabin().where("b.userId", userId);
    return applyHistoryScope(query)
      .orderBy("b.endDate", "desc")
      .limit(limit)
      .offset(offset)
      .then(attachCabins);
  },

  countHistoryByUserId(userId) {
    if (!userId) {
      throw new Error("userId is required");
    }

    const query = countWithDetails().where("b.userId", userId);
    return applyHistoryScope(query).count({ total: "*" }).first();
  },

  findForCabinOwnerPaginated(_ownerId, limit, offset) {
    return this.findAllPaginated(limit, offset);
  },

  countForCabinOwner(_ownerId) {
    return this.countAll();
  },

  findUpcomingForCabinOwnerPaginated(_ownerId, filters, limit, offset) {
    const query = applyOwnerFilters(applyUpcomingScope(selectWithCabin()), filters);
    return query
      .orderBy("b.startDate", "asc")
      .limit(limit)
      .offset(offset)
      .then(attachCabins);
  },

  countUpcomingForCabinOwner(_ownerId, filters) {
    const query = applyOwnerFilters(applyUpcomingScope(countWithDetails()), filters);
    return query.count({ total: "*" }).first();
  },

  findHistoryForCabinOwnerPaginated(_ownerId, filters, limit, offset) {
    const query = applyOwnerFilters(applyHistoryScope(selectWithCabin()), filters);
    return query
      .orderBy("b.endDate", "desc")
      .limit(limit)
      .offset(offset)
      .then(attachCabins);
  },

  countHistoryForCabinOwner(_ownerId, filters) {
    const query = applyOwnerFilters(applyHistoryScope(countWithDetails()), filters);
    return query.count({ total: "*" }).first();
  },

  findById(id) {
    if (!id) return null;

    return selectWithCabin()
      .where("b._id", id)
      .first()
      .then(attachCabin);
  },

  async create(data) {
    const inserted = await db("bookings").insert(data).returning("*");
    return inserted?.[0] || null;
  },

  async update(id, data) {
    const updated = await db("bookings")
      .where("_id", id)
      .update({ ...data, updatedAt: db.fn.now() })
      .returning("*");

    return updated?.[0] || null;
  },

  delete(id) {
    return db("bookings").where("_id", id).del();
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

  createBooking(data) {
    return this.create(data);
  },

  updateById(id, data) {
    return this.update(id, data);
  },
};

export const {
  findAll,
  findAllPaginated,
  countAll,
  findByUserId,
  findByUserIdPaginated,
  countByUserId,
  findUpcomingByUserIdPaginated,
  countUpcomingByUserId,
  findHistoryByUserIdPaginated,
  countHistoryByUserId,
  findForCabinOwnerPaginated,
  countForCabinOwner,
  findUpcomingForCabinOwnerPaginated,
  countUpcomingForCabinOwner,
  findHistoryForCabinOwnerPaginated,
  countHistoryForCabinOwner,
  findById,
  create,
  update,
  delete: deleteBooking,
  hasOverlap,
  createBooking,
  updateById,
} = bookingDao;

export default bookingDao;
