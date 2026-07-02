import assert from "node:assert/strict";
import test from "node:test";
import bookingDao from "../dao/booking.dao.js";
import rateDao from "../dao/rate.dao.js";
import { Booking } from "../models/booking.model.js";
import { updateBookingStatus } from "../services/booking.service.js";
import {
  BOOKING_STATUSES,
  canTransitionBookingStatus,
  shouldAutoCheckoutBooking,
  syncCompletedBookingStatus,
} from "../services/bookingStatus.service.js";
import { createRateForBooking } from "../services/rate.service.js";

const TODAY = new Date("2026-07-03T00:00:00");

test("uses the five supported booking statuses", () => {
  assert.deepEqual(BOOKING_STATUSES, [
    "pending",
    "confirmed",
    "checked-in",
    "checked-out",
    "cancelled",
  ]);
  assert.equal(new Booking().status, "pending");
});

test("allows the owner workflow transitions", () => {
  assert.equal(
    canTransitionBookingStatus({ status: "pending" }, "confirmed", TODAY),
    true,
  );
  assert.equal(
    canTransitionBookingStatus({ status: "pending" }, "cancelled", TODAY),
    true,
  );
  assert.equal(
    canTransitionBookingStatus(
      { status: "confirmed", startDate: "2026-07-04" },
      "checked-in",
      TODAY,
    ),
    true,
  );
  assert.equal(
    canTransitionBookingStatus({ status: "checked-in" }, "checked-out", TODAY),
    true,
  );
});

test("only allows confirmed cancellation before check-in date", () => {
  assert.equal(
    canTransitionBookingStatus(
      { status: "confirmed", startDate: "2026-07-04" },
      "cancelled",
      TODAY,
    ),
    true,
  );
  assert.equal(
    canTransitionBookingStatus(
      { status: "confirmed", startDate: "2026-07-03" },
      "cancelled",
      TODAY,
    ),
    false,
  );
});

test("rejects skipped, reversed, and terminal-state transitions", () => {
  assert.equal(
    canTransitionBookingStatus({ status: "pending" }, "checked-out", TODAY),
    false,
  );
  assert.equal(
    canTransitionBookingStatus({ status: "checked-in" }, "pending", TODAY),
    false,
  );
  assert.equal(
    canTransitionBookingStatus({ status: "checked-out" }, "pending", TODAY),
    false,
  );
  assert.equal(
    canTransitionBookingStatus({ status: "cancelled" }, "confirmed", TODAY),
    false,
  );
  assert.equal(
    canTransitionBookingStatus({ status: "pending" }, "unconfirmed", TODAY),
    false,
  );
});

test("auto check-out only applies to completed confirmed or checked-in stays", () => {
  assert.equal(
    shouldAutoCheckoutBooking(
      { status: "confirmed", endDate: "2026-07-02" },
      TODAY,
    ),
    true,
  );
  assert.equal(
    shouldAutoCheckoutBooking(
      { status: "checked-in", endDate: "2026-07-02" },
      TODAY,
    ),
    true,
  );
  assert.equal(
    shouldAutoCheckoutBooking(
      { status: "confirmed", endDate: "2026-07-03" },
      TODAY,
    ),
    false,
  );
  assert.equal(
    shouldAutoCheckoutBooking(
      { status: "pending", endDate: "2026-07-02" },
      TODAY,
    ),
    false,
  );
  assert.equal(
    shouldAutoCheckoutBooking(
      { status: "cancelled", endDate: "2026-07-02" },
      TODAY,
    ),
    false,
  );
});

test("persists auto check-out for a completed booking", async () => {
  const originalSync = bookingDao.syncCompletedStatusById;
  bookingDao.syncCompletedStatusById = async (bookingId) => ({
    _id: bookingId,
    status: "checked-out",
  });

  try {
    const booking = await syncCompletedBookingStatus(
      {
        _id: "booking-1",
        status: "checked-in",
        endDate: "2026-07-02",
        observations: "Keep this field",
      },
      TODAY,
    );

    assert.equal(booking.status, "checked-out");
    assert.equal(booking.observations, "Keep this field");
  } finally {
    bookingDao.syncCompletedStatusById = originalSync;
  }
});

test("owner status update enforces transitions and customer ownership rules", async () => {
  const originalUpdate = bookingDao.updateStatusIfCurrent;
  bookingDao.updateStatusIfCurrent = async (bookingId, currentStatuses, status) => ({
    _id: bookingId,
    status,
    previousStatus: currentStatuses[0],
  });

  const pendingBooking = {
    _id: "booking-2",
    status: "pending",
    startDate: "2026-07-10",
  };

  try {
    const confirmed = await updateBookingStatus(
      { role: "cabinOwner" },
      pendingBooking._id,
      "confirmed",
      pendingBooking,
    );
    assert.equal(confirmed.status, "confirmed");

    await assert.rejects(
      updateBookingStatus(
        { role: "cabinOwner" },
        pendingBooking._id,
        "checked-out",
        pendingBooking,
      ),
      /Invalid booking status transition/,
    );

    await assert.rejects(
      updateBookingStatus(
        { role: "customer" },
        pendingBooking._id,
        "confirmed",
        pendingBooking,
      ),
      /Only cabin owners/,
    );
  } finally {
    bookingDao.updateStatusIfCurrent = originalUpdate;
  }
});

test("rating syncs a completed booking before enforcing checked-out status", async () => {
  const originalFindBooking = bookingDao.findById;
  const originalSync = bookingDao.syncCompletedStatusById;
  const originalFindRate = rateDao.findByBookingId;
  const originalCreateRate = rateDao.create;

  bookingDao.findById = async () => ({
    _id: "booking-3",
    userId: "customer-1",
    cabinId: "cabin-1",
    status: "confirmed",
    endDate: "2026-07-02",
  });
  bookingDao.syncCompletedStatusById = async () => ({
    _id: "booking-3",
    status: "checked-out",
  });
  rateDao.findByBookingId = async () => null;
  rateDao.create = async (data) => ({ _id: "rate-1", ...data });

  try {
    const rate = await createRateForBooking(
      { _id: "customer-1", role: "customer" },
      { bookingId: "booking-3", rating: "5", comment: "Great stay" },
    );

    assert.equal(rate.bookingId, "booking-3");
    assert.equal(rate.rating, 5);
  } finally {
    bookingDao.findById = originalFindBooking;
    bookingDao.syncCompletedStatusById = originalSync;
    rateDao.findByBookingId = originalFindRate;
    rateDao.create = originalCreateRate;
  }
});
