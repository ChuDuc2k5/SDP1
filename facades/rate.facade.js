import * as bookingService from "../services/booking.service.js";
import * as cabinService from "../services/cabin.service.js";
import * as rateService from "../services/rate.service.js";

export const getRatingSectionData = async (currentUser, bookingId) => {
  const booking = await bookingService.getBookingDetail(currentUser, bookingId);
  const existingRate = await rateService.findRateByBookingId(bookingId);

  return {
    booking,
    existingRate,
    hasRating: Boolean(existingRate),
  };
};

export const getRatesByCabin = async (cabinId) => {
  const [cabin, rates] = await Promise.all([
    cabinService.getCabinById(cabinId),
    rateService.findRatesByCabinId(cabinId),
  ]);

  return { cabin, rates };
};

export const submitRating = async (currentUser, bookingId, ratingData = {}) => {
  return rateService.createRateForBooking(currentUser, {
    ...ratingData,
    bookingId,
  });
};

export const updateRating = async (currentUser, ratingId, ratingData = {}) => {
  return rateService.updateRate(currentUser, ratingId, ratingData);
};

export const deleteRating = async (currentUser, ratingId) => {
  return rateService.deleteRate(currentUser, ratingId);
};

export default {
  getRatingSectionData,
  getRatesByCabin,
  submitRating,
  updateRating,
  deleteRating,
};
