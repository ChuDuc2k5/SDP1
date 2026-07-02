import * as bookingService from "../services/booking.service.js";
import * as rateService from "../services/rate.service.js";
import { getUserId, ROLE } from "../utils/sessionUser.js";

const getRateErrorMessage = (query = {}) => {
  if (query.rate !== "error") return null;

  if (query.reason === "invalid") {
    return "Rating must be a whole number from 1 to 5.";
  }
  if (query.reason === "forbidden") {
    return "You can only update or delete your own rating.";
  }
  if (query.reason === "not-found") {
    return "Rating not found. It may already have been deleted.";
  }
  if (query.action === "update") {
    return "Failed to update rating. Please try again.";
  }
  if (query.action === "delete") {
    return "Failed to delete rating. Please try again.";
  }
  return "Failed to submit rating. Please try again.";
};

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
  const canRate =
    currentUser?.role === ROLE.CUSTOMER &&
    booking.userId === getUserId(currentUser) &&
    booking.status === "checked-out" &&
    !existingRate;
  const canManageRate =
    currentUser?.role === ROLE.CUSTOMER &&
    booking.userId === getUserId(currentUser) &&
    Boolean(existingRate);

  return {
    booking,
    existingRate,
    canRate,
    canManageRate,
    rateSuccess: query.rate === "success",
    rateErrorMessage: getRateErrorMessage(query),
    rateUpdated: query.rate === "updated",
    rateDeleted: query.rate === "deleted",
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
