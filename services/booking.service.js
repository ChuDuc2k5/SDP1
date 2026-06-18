import bookingModel from "../models/booking.model.js";
import bookingPolicyModel from "../models/bookingPolicy.model.js";
import cabinModel from "../models/cabin.model.js";
import settingModel from "../models/setting.model.js";
import { getUserId, ROLE } from "../utils/sessionUser.js";

const CUSTOMER_EDIT_BLOCKED_STATUSES = ["checked-in", "checked-out"];
const OWNER_ALLOWED_STATUSES = [
  "unconfirmed",
  "confirmed",
  "checked-in",
  "checked-out",
  "cancelled",
  "pending",
];

const isUuid = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || ""),
  );

const toDateOnly = (value) => {
  if (!value) return null;
  if (value instanceof Date) {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const diffNights = (startDate, endDate) => {
  const start = toDateOnly(startDate);
  const end = toDateOnly(endDate);

  if (!start || !end || end <= start) {
    throw new Error("endDate must be greater than startDate");
  }

  return Math.round((end - start) / (1000 * 60 * 60 * 24));
};

const assertCustomer = (currentUser) => {
  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  if (currentUser.role !== ROLE.CUSTOMER) {
    throw new Error("Only customers can create bookings");
  }
};

const assertAuthorized = (currentUser, booking) => {
  const userId = getUserId(currentUser);

  if (!currentUser || !booking) {
    throw new Error("Booking not found or unauthorized");
  }

  if (currentUser.role === ROLE.CABIN_OWNER) {
    // TODO: When cabins has ownerId, restrict owners to their own cabins.
    return;
  }

  if (currentUser.role !== ROLE.CUSTOMER || booking.userId !== userId) {
    throw new Error("Booking not found or unauthorized");
  }
};

const getBreakfastPrice = async (cabinId) => {
  const policy = await bookingPolicyModel.findByCabinId(cabinId);
  if (policy?.breakfastPrice != null) {
    return Number(policy.breakfastPrice);
  }

  const settings = await settingModel.getCurrent();
  return Number(settings?.breakfastPrice || 15);
};

const buildPricing = async ({ cabin, startDate, endDate, numGuests, type, hasBreakfast }) => {
  const numNights = diffNights(startDate, endDate);
  const guests = Number(numGuests);

  if (!Number.isInteger(guests) || guests <= 0) {
    throw new Error("numGuests must be greater than 0");
  }

  if (guests > Number(cabin.maxCapacity)) {
    throw new Error("numGuests exceeds cabin maxCapacity");
  }

  const bookingType = type || "basic";
  const applyDiscount = bookingType === "discount" || bookingType === "premium";
  const includeBreakfast =
    hasBreakfast === true ||
    hasBreakfast === "true" ||
    bookingType === "breakfast" ||
    bookingType === "premium";

  const regularPrice = Number(cabin.regularPrice);
  const discount = applyDiscount ? Number(cabin.discount || 0) : 0;
  const nightlyPrice = regularPrice * (1 - discount / 100);
  const cabinPrice = Number((nightlyPrice * numNights).toFixed(2));
  const breakfastPrice = await getBreakfastPrice(cabin._id);
  const extrasPrice = includeBreakfast
    ? Number((breakfastPrice * guests * numNights).toFixed(2))
    : 0;

  return {
    numNights,
    numGuests: guests,
    cabinPrice,
    extrasPrice,
    totalPrice: Number((cabinPrice + extrasPrice).toFixed(2)),
    hasBreakfast: includeBreakfast,
  };
};

export const listBookingsForUser = async (currentUser) => {
  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  if (currentUser.role === ROLE.CABIN_OWNER) {
    // TODO: When cabins has ownerId, restrict owners to bookings for their cabins.
    return bookingModel.findAll();
  }

  const userId = getUserId(currentUser);
  if (!userId) {
    throw new Error("userId is required");
  }

  return bookingModel.findByUserId(userId);
};

export const getBookingDetail = async (currentUser, bookingId) => {
  if (!isUuid(bookingId)) {
    throw new Error("Booking not found or unauthorized");
  }

  const booking = await bookingModel.findById(bookingId);
  assertAuthorized(currentUser, booking);
  return booking;
};

export const getCabinForNewBooking = async (currentUser, cabinId) => {
  assertCustomer(currentUser);

  if (!isUuid(cabinId)) {
    throw new Error("Cabin not found");
  }

  const cabin = await cabinModel.findById(cabinId);
  if (!cabin) {
    throw new Error("Cabin not found");
  }

  return cabin;
};

export const createBooking = async (currentUser, payload) => {
  assertCustomer(currentUser);

  const userId = getUserId(currentUser);
  const { cabinId, startDate, endDate, type, observations } = payload;

  if (!isUuid(userId)) {
    throw new Error("userId is required");
  }

  if (!isUuid(cabinId)) {
    throw new Error("cabinId is required");
  }

  const cabin = await cabinModel.findById(cabinId);
  if (!cabin) {
    throw new Error("Cabin not found");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = toDateOnly(startDate);
  if (!start || start < today) {
    throw new Error("startDate must be today or in the future");
  }

  const pricing = await buildPricing({
    cabin,
    startDate,
    endDate,
    numGuests: payload.numGuests,
    type,
    hasBreakfast: payload.hasBreakfast,
  });

  const hasOverlap = await bookingModel.hasOverlap({ cabinId, startDate, endDate });
  if (hasOverlap) {
    throw new Error("Cabin is not available for the selected dates");
  }

  return bookingModel.createBooking({
    userId,
    cabinId,
    startDate,
    endDate,
    ...pricing,
    status: "confirmed",
    isPaid: false,
    observations: observations?.trim() || null,
  });
};

export const updateBooking = async (currentUser, bookingId, payload) => {
  const booking = await getBookingDetail(currentUser, bookingId);

  if (
    currentUser.role === ROLE.CUSTOMER &&
    CUSTOMER_EDIT_BLOCKED_STATUSES.includes(booking.status)
  ) {
    throw new Error("Booking cannot be edited after check-in");
  }

  const startDate = payload.startDate || booking.startDate;
  const endDate = payload.endDate || booking.endDate;

  const pricing = await buildPricing({
    cabin: booking.cabin,
    startDate,
    endDate,
    numGuests: payload.numGuests || booking.numGuests,
    type: booking.hasBreakfast ? "breakfast" : "basic",
    hasBreakfast: booking.hasBreakfast,
  });

  const hasOverlap = await bookingModel.hasOverlap({
    cabinId: booking.cabinId,
    startDate,
    endDate,
    excludeBookingId: bookingId,
  });

  if (hasOverlap) {
    throw new Error("Cabin is not available for the selected dates");
  }

  const updateData = {
    startDate,
    endDate,
    ...pricing,
    observations: payload.observations?.trim() || null,
  };

  if (
    currentUser.role === ROLE.CABIN_OWNER &&
    payload.status &&
    OWNER_ALLOWED_STATUSES.includes(payload.status)
  ) {
    updateData.status = payload.status;
  }

  return bookingModel.updateById(bookingId, updateData);
};

export const cancelBooking = async (currentUser, bookingId) => {
  const booking = await getBookingDetail(currentUser, bookingId);

  if (booking.status === "checked-out") {
    throw new Error("Checked-out booking cannot be cancelled");
  }

  return bookingModel.updateById(bookingId, { status: "cancelled" });
};
