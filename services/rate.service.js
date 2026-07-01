import bookingDao from "../dao/booking.dao.js";
import rateDao from "../dao/rate.dao.js";
import { Booking } from "../models/booking.model.js";
import { Rate } from "../models/rate.model.js";
import { getUserId, ROLE } from "../utils/sessionUser.js";

const toRateView = (row) => Rate.fromRow(row)?.toJSON();

const isUuid = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || ""),
  );

const createHttpError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const assertCustomer = (currentUser) => {
  if (!currentUser) {
    throw createHttpError("Unauthorized", 401);
  }

  if (currentUser.role !== ROLE.CUSTOMER) {
    throw createHttpError("Only customers can manage ratings", 403);
  }
};

const parseRating = (rating) => {
  const numericRating = Number(rating);

  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    throw createHttpError("rating must be an integer from 1 to 5", 400);
  }

  return numericRating;
};

const normalizeComment = (comment) => {
  if (comment === undefined || comment === null || comment === "") {
    return null;
  }

  if (typeof comment !== "string") {
    throw createHttpError("comment must be a string", 400);
  }

  return comment.trim() || null;
};

const findOwnedRate = async (currentUser, ratingId) => {
  assertCustomer(currentUser);

  if (!isUuid(ratingId)) {
    throw createHttpError("Rating not found", 404);
  }

  const rate = await rateDao.findById(ratingId);
  if (!rate) {
    throw createHttpError("Rating not found", 404);
  }

  if (rate.userId !== getUserId(currentUser)) {
    throw createHttpError("Forbidden", 403);
  }

  return rate;
};

export const findRatesByCabinId = async (cabinId) => {
  const rates = await rateDao.findByCabinId(cabinId);
  return rates.map(toRateView);
};

export const findRateByBookingId = async (bookingId) => {
  const rate = await rateDao.findByBookingId(bookingId);
  return toRateView(rate);
};

export const findRateSummariesByCabinIds = async (cabinIds) => {
  const summaries = await rateDao.findSummariesByCabinIds(cabinIds);

  return summaries.map((summary) => ({
    cabinId: summary.cabinId,
    avgRating: Number(summary.avgRating).toFixed(1),
    reviewCount: Number(summary.reviewCount || 0),
  }));
};

export const createRateForBooking = async (currentUser, { bookingId, rating, comment }) => {
  assertCustomer(currentUser);

  if (!bookingId || !rating) {
    throw createHttpError("bookingId and rating are required", 400);
  }

  const numericRating = parseRating(rating);

  const booking = await bookingDao.findById(bookingId);
  if (!booking) {
    throw createHttpError("Booking not found", 404);
  }

  if (booking.userId !== getUserId(currentUser)) {
    throw createHttpError("Forbidden", 403);
  }

  const bookingEntity = Booking.fromRow(booking);
  if (!bookingEntity.isCheckedOut()) {
    throw createHttpError("Only checked-out bookings can be rated", 400);
  }

  const existedRate = await rateDao.findByBookingId(bookingId);
  if (existedRate) {
    throw createHttpError("Booking already rated", 409);
  }

  const createdRate = await rateDao.create({
    userId: getUserId(currentUser),
    cabinId: booking.cabinId,
    bookingId,
    rating: numericRating,
    comment: normalizeComment(comment),
  });

  return toRateView(createdRate);
};

export const updateRate = async (currentUser, ratingId, { rating, comment }) => {
  await findOwnedRate(currentUser, ratingId);

  const updatedRate = await rateDao.updateById(ratingId, {
    rating: parseRating(rating),
    comment: normalizeComment(comment),
  });

  if (!updatedRate) {
    throw createHttpError("Rating not found", 404);
  }

  return toRateView(updatedRate);
};

export const deleteRate = async (currentUser, ratingId) => {
  await findOwnedRate(currentUser, ratingId);

  const deletedRate = await rateDao.deleteById(ratingId);
  if (!deletedRate) {
    throw createHttpError("Rating not found", 404);
  }

  return toRateView(deletedRate);
};
