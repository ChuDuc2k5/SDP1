import * as bookingService from "../services/booking.service.js";
import * as rateService from "../services/rate.service.js";
import { getUserId, ROLE } from "../utils/sessionUser.js";

export const getBookingPageData = async (currentUser, query = {}) => {
  return bookingService.getBookingPageData(currentUser, query);
};

export const getCabinOwnerBookingManagementData = async (
  currentUser,
  query = {},
) => {
  return bookingService.getBookingPageData(currentUser, query);
};

export const getBookingDetailPageData = async (
  currentUser,
  bookingId,
  query = {},
) => {
  const booking = await bookingService.getBookingDetail(currentUser, bookingId);
  const existingRate = await rateService.findRateByBookingId(bookingId);
  const ownsBooking =
    currentUser?.role === ROLE.CUSTOMER &&
    booking.userId === getUserId(currentUser);
  const canRate =
    ownsBooking &&
    booking.status === "checked-out" &&
    !existingRate;

  return {
    booking,
    existingRate,
    canRate,
    isOwnBooking: ownsBooking,
    canManageRate: ownsBooking && Boolean(existingRate),
    rateSuccess: query.rate === "success",
    rateError: query.rate === "error",
    rateUpdated: query.rate === "updated",
    rateDeleted: query.rate === "deleted",
    rateMessage:
      query.rate === "error" && typeof query.message === "string"
        ? query.message
        : null,
  };
};

export const getBookingEditPageData = async (currentUser, bookingId) => {
  return bookingService.getBookingEditPageData(currentUser, bookingId);
};

export const getNewBookingPageData = async (currentUser, cabinId) => {
  return bookingService.getNewBookingPageData(currentUser, cabinId);
};

export const createBooking = async (currentUser, bookingData) => {
  return bookingService.createBooking(currentUser, bookingData);
};

export const updateBooking = async (currentUser, bookingId, updateData) => {
  return bookingService.updateBooking(currentUser, bookingId, updateData);
};

export const cancelBooking = async (currentUser, bookingId) => {
  return bookingService.cancelBooking(currentUser, bookingId);
};

export default {
  getBookingPageData,
  getCabinOwnerBookingManagementData,
  getBookingDetailPageData,
  getBookingEditPageData,
  getNewBookingPageData,
  createBooking,
  updateBooking,
  cancelBooking,
};
