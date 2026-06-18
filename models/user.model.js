import db from "../config/db.js";

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

export const updatePassword = (email, password) => {
  return db("users")
    .where({ email })
    .update({ password, updatedAt: db.fn.now() });
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
