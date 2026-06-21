import db from "../dbHelper/db.js";

const DEFAULT_SETTINGS = {
  miniBookingLength: 1,
  maxBookingLength: 30,
  maxNumberOfGuests: 10,
  breakfastPrice: 15,
};

const settingDao = {
  async getCurrent() {
    return this.createDefaultIfMissing();
  },

  findCurrent() {
    return db("settings").orderBy("_id", "asc").first();
  },

  async createDefaultIfMissing() {
    const current = await this.findCurrent();
    if (current) return current;

    const inserted = await db("settings").insert(DEFAULT_SETTINGS).returning("*");
    return inserted?.[0] || DEFAULT_SETTINGS;
  },

  async update(id, payload) {
    const updated = await db("settings")
      .where("_id", id)
      .update({ ...payload, updatedAt: db.fn.now() })
      .returning("*");

    return updated?.[0] || null;
  },

  async updateCurrent(payload) {
    const current = await this.getCurrent();

    const updateData = {
      miniBookingLength: Number(payload.miniBookingLength) || current.miniBookingLength,
      maxBookingLength: Number(payload.maxBookingLength) || current.maxBookingLength,
      maxNumberOfGuests:
        Number(payload.maxNumberOfGuests) || current.maxNumberOfGuests,
      breakfastPrice: Number(payload.breakfastPrice) || current.breakfastPrice,
    };

    return (await this.update(current._id, updateData)) || { ...current, ...updateData };
  },
};

export const getCurrent = () => settingDao.getCurrent();
export const findCurrent = () => settingDao.findCurrent();
export const createDefaultIfMissing = () => settingDao.createDefaultIfMissing();
export const update = (id, payload) => settingDao.update(id, payload);
export const updateCurrent = (payload) => settingDao.updateCurrent(payload);

export default settingDao;
