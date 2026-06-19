import bookingPolicyDao from "../dao/bookingPolicy.dao.js";
import { BookingPolicy } from "../models/bookingPolicy.model.js";

export const findBookingPolicyByCabinId = async (cabinId) => {
  const policy = await bookingPolicyDao.findByCabinId(cabinId);
  return BookingPolicy.fromRow(policy);
};

export default {
  findBookingPolicyByCabinId,
};
