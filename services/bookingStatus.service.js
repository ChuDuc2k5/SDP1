import bookingDao from "../dao/booking.dao.js";

export const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "checked-in",
  "checked-out",
  "cancelled",
];

const AUTO_CHECKOUT_STATUSES = ["confirmed", "checked-in"];

const OWNER_STATUS_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["checked-in", "cancelled"],
  "checked-in": ["checked-out"],
  "checked-out": [],
  cancelled: [],
};

const toDateOnly = (value) => {
  if (!value) return null;

  const date =
    value instanceof Date
      ? new Date(value)
      : new Date(String(value).includes("T") ? value : `${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;

  date.setHours(0, 0, 0, 0);
  return date;
};

export const canTransitionBookingStatus = (
  booking,
  nextStatus,
  todayValue = new Date(),
) => {
  if (!booking || !BOOKING_STATUSES.includes(nextStatus)) return false;

  const allowedStatuses = OWNER_STATUS_TRANSITIONS[booking.status] || [];
  if (!allowedStatuses.includes(nextStatus)) return false;

  if (booking.status === "confirmed" && nextStatus === "cancelled") {
    const startDate = toDateOnly(booking.startDate);
    const today = toDateOnly(todayValue);
    return Boolean(startDate && today && startDate > today);
  }

  return true;
};

export const getOwnerStatusActions = (booking, todayValue = new Date()) => ({
  canConfirm: canTransitionBookingStatus(booking, "confirmed", todayValue),
  canCancel: canTransitionBookingStatus(booking, "cancelled", todayValue),
  canCheckIn: canTransitionBookingStatus(booking, "checked-in", todayValue),
});

export const shouldAutoCheckoutBooking = (
  booking,
  todayValue = new Date(),
) => {
  if (!booking || !AUTO_CHECKOUT_STATUSES.includes(booking.status)) {
    return false;
  }

  const endDate = toDateOnly(booking.endDate);
  const today = toDateOnly(todayValue);
  return Boolean(endDate && today && endDate < today);
};

export const syncCompletedBookingStatus = async (
  booking,
  todayValue = new Date(),
) => {
  if (!shouldAutoCheckoutBooking(booking, todayValue)) {
    return booking;
  }

  const updatedBooking = await bookingDao.syncCompletedStatusById(booking._id);

  if (updatedBooking) {
    return { ...booking, ...updatedBooking };
  }

  return bookingDao.findById(booking._id);
};

export const syncCompletedBookingStatuses = async () => {
  return bookingDao.syncCompletedStatuses();
};
