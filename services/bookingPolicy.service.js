import bookingPolicyDao from "../dao/bookingPolicy.dao.js";
import { BookingPolicy } from "../models/bookingPolicy.model.js";

export const findBookingPolicyByCabinId = async (cabinId) => {
  const policy = await bookingPolicyDao.findByCabinId(cabinId);
  return BookingPolicy.fromRow(policy);
};

export const createBookingPolicy = async (data) => {
  const policy = await bookingPolicyDao.create(data);
  return BookingPolicy.fromRow(policy);
};

export const updateBookingPolicyByCabinId = async (cabinId, data) => {
  const policy = await bookingPolicyDao.updateByCabinId(cabinId, data);
  return BookingPolicy.fromRow(policy);
};

export const deleteBookingPolicyByCabinId = async (cabinId) => {
  return bookingPolicyDao.deleteByCabinId(cabinId);
};

export default {
  findBookingPolicyByCabinId,
  createBookingPolicy,
  updateBookingPolicyByCabinId,
  deleteBookingPolicyByCabinId,
};
