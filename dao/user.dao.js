import db from "../dbHelper/db.js";

const isUuid = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i.test(
    String(value || ""),
  );

export const findById = (id) => {
  if (!id) return null;
  return db("users").where("_id", id).first();
};

export const findByEmail = (email) => {
  return db("users").where({ email }).first();
};

export const findByEmailInsensitive = (email) => {
  return db("users")
    .whereRaw('LOWER("email") = ?', [String(email || "").trim().toLowerCase()])
    .first();
};

export const findUserByEmail = findByEmail;

export const create = async (user) => {
  const inserted = await db("users")
    .insert({
      fullName: user.fullName,
      email: user.email,
      password: user.password,
      phone: user.phone || null,
      nationalId: user.nationalId || null,
      dateOfBirth: user.dateOfBirth || null,
      gender: user.gender || null,
      address: user.address || null,
      nationality: user.nationality || null,
      role: user.role,
    })
    .returning("*");

  return inserted?.[0] || null;
};

export const createUser = create;

export const updatePassword = (idOrEmail, password) => {
  const where = isUuid(idOrEmail) ? { _id: idOrEmail } : { email: idOrEmail };

  return db("users")
    .where(where)
    .update({ password, updatedAt: db.fn.now() });
};

export const update = async (id, data) => {
  if (!id) return null;

  const allowedFields = [
    "fullName",
    "email",
    "phone",
    "nationalId",
    "dateOfBirth",
    "gender",
    "address",
    "nationality",
    "role",
  ];

  const updateData = {};
  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      updateData[field] = data[field] || null;
    }
  }

  updateData.updatedAt = db.fn.now();

  const updated = await db("users")
    .where("_id", id)
    .update(updateData)
    .returning("*");

  return updated?.[0] || null;
};

export const updateByEmail = async (email, data) => {
  const allowedFields = [
    "fullName",
    "phone",
    "nationalId",
    "dateOfBirth",
    "gender",
    "address",
    "nationality",
  ];

  const updateData = {};
  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      updateData[field] = data[field] || null;
    }
  }

  updateData.updatedAt = db.fn.now();

  const updated = await db("users")
    .where({ email })
    .update(updateData)
    .returning("*");

  return updated?.[0] || null;
};

export const updateUserProfile = updateByEmail;

export const deleteUser = (id) => {
  return db("users").where("_id", id).del();
};

export { deleteUser as delete };

export default {
  findById,
  findByEmail,
  findByEmailInsensitive,
  findUserByEmail,
  create,
  createUser,
  update,
  updatePassword,
  updateByEmail,
  updateUserProfile,
  delete: deleteUser,
};
