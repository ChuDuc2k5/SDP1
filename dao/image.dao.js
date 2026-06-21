import db from "../dbHelper/db.js";

const imageDao = {
  findByCabinId(cabinId) {
    if (!cabinId) return [];

    return db("images")
      .where("cabinId", cabinId)
      .orderBy("isCover", "desc")
      .orderBy("createdAt", "asc");
  },

  findCoverByCabinId(cabinId) {
    if (!cabinId) return null;

    return db("images")
      .where("cabinId", cabinId)
      .where("isCover", true)
      .first();
  },

  async create(data) {
    const inserted = await db("images")
      .insert({
        cabinId: data.cabinId,
        imageUrl: data.imageUrl,
        name: data.name || null,
        isCover: Boolean(data.isCover),
      })
      .returning("*");

    return inserted?.[0] || null;
  },

  async update(id, data) {
    const updated = await db("images")
      .where("_id", id)
      .update({
        imageUrl: data.imageUrl,
        name: data.name || null,
        isCover: Boolean(data.isCover),
      })
      .returning("*");

    return updated?.[0] || null;
  },

  delete(id) {
    return db("images").where("_id", id).del();
  },
};

export const findByCabinId = imageDao.findByCabinId;
export const findCoverByCabinId = imageDao.findCoverByCabinId;
export const create = imageDao.create;
export const update = imageDao.update;
export const deleteImage = imageDao.delete;
export { deleteImage as delete };

export default imageDao;
