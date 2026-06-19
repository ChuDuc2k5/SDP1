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

const cabinModel = {
  findAllQuery() {
    return db("cabins").select("*");
  },

  findAll() {
    return db("cabins").select("*").orderBy("name", "asc");
  },

  findPaginated({ limit, offset }) {
    return db("cabins").select("*").limit(limit).offset(offset);
  },

  countAll() {
    return db("cabins").count({ total: "*" }).first();
  },

  findById(id) {
    if (!id) return null;
    return db("cabins").where("_id", id).first();
  },

  async create(cabinData) {
    const inserted = await db("cabins")
      .insert(normalizeCabinPayload(cabinData))
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

  async updateById(id, cabinData) {
    const updated = await db("cabins")
      .where("_id", id)
      .update({ ...cabinData, updatedAt: db.fn.now() })
      .returning("*");

    return updated?.[0] || null;
  },

  deleteById(id) {
    return db("cabins").where("_id", id).del();
  },

  add(cabinData) {
    return this.create(cabinData);
  },

  update(id, cabinData) {
    return this.updateById(id, cabinData);
  },

  delete(id) {
    return this.deleteById(id);
  },
};

export default cabinModel;
