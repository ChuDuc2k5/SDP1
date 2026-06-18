import bookingModel from "../models/booking.model.js";
import rateModel from "../models/rate.model.js";
import { getUserId, ROLE } from "../utils/sessionUser.js";

export const findRatesByCabinId = (cabinId) => {
  return rateModel.findByCabinId(cabinId);
};

export const findRateByBookingId = (bookingId) => {
  return rateModel.findByBookingId(bookingId);
};

export const createRateForBooking = async (currentUser, { bookingId, rating, comment }) => {
  if (!currentUser) {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }

  if (currentUser.role !== ROLE.CUSTOMER) {
    const error = new Error("Only customers can rate bookings");
    error.status = 403;
    throw error;
  }

  if (!bookingId || !rating) {
    const error = new Error("bookingId and rating are required");
    error.status = 400;
    throw error;
  }

  const numericRating = Number(rating);
  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    const error = new Error("rating must be from 1 to 5");
    error.status = 400;
    throw error;
  }

  const booking = await bookingModel.findById(bookingId);
  if (!booking) {
    const error = new Error("Booking not found");
    error.status = 404;
    throw error;
  }

  if (booking.userId !== getUserId(currentUser)) {
    const error = new Error("Forbidden");
    error.status = 403;
    throw error;
  }

  if (booking.status !== "checked-out") {
    const error = new Error("Only checked-out bookings can be rated");
    error.status = 400;
    throw error;
  }

  const existedRate = await rateModel.findByBookingId(bookingId);
  if (existedRate) {
    const error = new Error("Booking already rated");
    error.status = 409;
    throw error;
  }

  return rateModel.create({
    userId: getUserId(currentUser),
    cabinId: booking.cabinId,
    bookingId,
    rating: numericRating,
    comment: comment?.trim() || null,
  });
};
