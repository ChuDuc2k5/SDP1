import db from "../dbHelper/db.js";

export const findUserByEmail = async (email) => {
  const user = await db("users").where({ email }).first();

  return user;
};

export const createUser = async (user) => {
  const { fullName, email, password, phone, nationalId, dateOfBirth } = user;

  await db("users").insert({
    fullName: fullName,
    email: email,
    password: password,
    phone: phone,
    nationalId: nationalId,
    dateOfBirth: dateOfBirth,
    role: "user",
  });
};

export const updatePassword = async (email, password) => {
  return await db("users").where({ email }).update({ password });
};

export const updateUserProfile = async (email, data) => {
  const { fullName, phone, dateOfBirth } = data;

  await db("users").where({ email }).update({
    fullName,
    phone,
    dateOfBirth,
  });
};
