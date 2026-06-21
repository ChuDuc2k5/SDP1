import db from "../dbHelper/db.js";
import { CabinPrototype } from "../patterns/prototype/cabin/cabinPrototype.js";

const withoutSystemFields = (cabin = {}) => {
  const { _id, id, created_at, updated_at, createdAt, updatedAt, ...data } = cabin;
  return data;
};

const normalizeCabinPayload = (data = {}) => ({
  name: data.name,
  maxCapacity: data.maxCapacity,
  regularPrice: data.regularPrice,
  discount: data.discount ?? 0,
  image: data.image,
  description: data.description || "",
  location: data.location || null,
  amenities: data.amenities || null,
});

const applyFilters = (query, filters = {}) => {
  const name = typeof filters.name === "string" ? filters.name.trim() : "";
  if (name) {
    query.whereILike("name", `%${name}%`);
  }

  if (filters.maxCapacity !== undefined && filters.maxCapacity !== "") {
    query.where("maxCapacity", ">=", Number(filters.maxCapacity));
  }

  return query;
};

const cabinDao = {
  findAllQuery() {
    return db("cabins").select("*");
  },

  findAll() {
    return db("cabins").select("*").orderBy("name", "asc");
  },

  findPaginated({ limit, offset, filters = {} }) {
    const query = applyFilters(db("cabins").select("*"), filters);

    if (limit !== undefined) {
      query.limit(limit);
    }

    if (offset !== undefined) {
      query.offset(offset);
    }

    return query;
  },

  countAll(filters = {}) {
    return applyFilters(db("cabins"), filters).count({ total: "*" }).first();
  },

  findById(id) {
    if (!id) return null;
    return db("cabins").where("_id", id).first();
  },

  async create(data) {
    const inserted = await db("cabins")
      .insert(normalizeCabinPayload(data))
      .returning("*");

    return inserted?.[0] || null;
  },

  async duplicateById(id, overrides = {}) {
    const cabin = await this.findById(id);
    if (!cabin) {
      return null;
    }

    const prototype = new CabinPrototype(cabin);
    const clonedCabin = normalizeCabinPayload({
      ...withoutSystemFields(prototype.clone()),
      name: `${cabin.name} (Copy)`,
      ...overrides,
    });

    const inserted = await db("cabins").insert(clonedCabin).returning("*");
    return inserted?.[0] || null;
  },

  duplicate(id, data = {}) {
    return this.duplicateById(id, data);
  },

  async update(id, data) {
    const updated = await db("cabins")
      .where("_id", id)
      .update({ ...data, updatedAt: db.fn.now() })
      .returning("*");

    return updated?.[0] || null;
  },

  delete(id) {
    return db("cabins").where("_id", id).del();
  },

  add(data) {
    return this.create(data);
  },

  updateById(id, data) {
    return this.update(id, data);
  },

  deleteById(id) {
    return this.delete(id);
  },
};

export const {
  findAllQuery,
  findAll,
  findPaginated,
  countAll,
  findById,
  create,
  duplicateById,
  duplicate,
  update,
  delete: deleteCabin,
  add,
  updateById,
  deleteById,
} = cabinDao;

export default cabinDao;
