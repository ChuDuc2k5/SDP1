import {
<<<<<<< Updated upstream
  createRateForBooking,
  deleteRate,
  findRatesByCabinId,
  updateRate,
} from "../services/rate.service.js";

const buildBookingDetailUrl = (bookingId, params) => {
  if (!bookingId) return "/booking";

  const query = new URLSearchParams(params);
  return `/booking/detail/${encodeURIComponent(bookingId)}?${query.toString()}`;
};
=======
  deleteRating,
  getRatesByCabin,
  submitRating,
  updateRating,
} from "../facades/rate.facade.js";
>>>>>>> Stashed changes

const isUuid = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || ""),
  );

const buildBookingDetailRedirect = (bookingId, rateStatus, error = null) => {
  if (!isUuid(bookingId)) {
    return "/booking";
  }

  const params = new URLSearchParams({ rate: rateStatus });
  if (error) {
    const message =
      error.status && error.status < 500
        ? error.message
        : "Rating request failed. Please try again.";
    params.set("message", message);
  }

  return `/booking/detail/${bookingId}?${params.toString()}`;
};

export const listRatesByCabin = async (req, res) => {
  try {
    const rates = await findRatesByCabinId(req.params.cabinId);

    res.json({
      success: true,
      data: rates,
    });
  } catch (error) {
    console.error("Failed to load cabin rates:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const submitRateForm = async (req, res) => {
  try {
<<<<<<< Updated upstream
    const createdRate = await createRateForBooking(req.currentUser, req.body);
    return res.redirect(`/booking/detail/${createdRate.bookingId}?rate=success`);
=======
    const createdRate = await submitRating(
      req.currentUser,
      req.body.bookingId,
      req.body,
    );
    return res.redirect(
      buildBookingDetailRedirect(createdRate.bookingId, "success"),
    );
>>>>>>> Stashed changes
  } catch (error) {
    console.error("Failed to submit rate:", error.message);
    return res.redirect(
      buildBookingDetailRedirect(req.body.bookingId, "error", error),
    );
  }
};

export const updateRateForm = async (req, res) => {
  try {
    const updatedRate = await updateRating(
      req.currentUser,
      req.params.ratingId,
      req.body,
    );

    return res.redirect(
      buildBookingDetailRedirect(updatedRate.bookingId, "updated"),
    );
  } catch (error) {
    console.error("Failed to update rate:", error.message);
    return res.redirect(
      buildBookingDetailRedirect(req.body.bookingId, "error", error),
    );
  }
};

export const deleteRateForm = async (req, res) => {
  try {
    const deletedRate = await deleteRating(
      req.currentUser,
      req.params.ratingId,
    );

    return res.redirect(
      buildBookingDetailRedirect(deletedRate.bookingId, "deleted"),
    );
  } catch (error) {
    console.error("Failed to delete rate:", error.message);
    return res.redirect(
      buildBookingDetailRedirect(req.body.bookingId, "error", error),
    );
  }
};

export const submitRateJson = async (req, res) => {
  try {
    const createdRate = await createRateForBooking(req.currentUser, req.body);

    res.status(201).json({
      success: true,
      data: createdRate,
    });
  } catch (error) {
    console.error("Failed to create rate:", error.message);
    res.status(error.status || 500).json({
      success: false,
      message: error.status ? error.message : "Internal Server Error",
    });
  }
};

export const updateRateForm = async (req, res) => {
  try {
    const updatedRate = await updateRate(
      req.currentUser,
      req.params.ratingId,
      req.body,
    );

    return res.redirect(
      buildBookingDetailUrl(updatedRate.bookingId, { rate: "updated" }),
    );
  } catch (error) {
    console.error("Failed to update rate:", error.message);
    return res.redirect(
      buildBookingDetailUrl(req.body.bookingId, {
        rate: "error",
        action: "update",
      }),
    );
  }
};

export const deleteRateForm = async (req, res) => {
  try {
    const deletedRate = await deleteRate(req.currentUser, req.params.ratingId);

    return res.redirect(
      buildBookingDetailUrl(deletedRate.bookingId, { rate: "deleted" }),
    );
  } catch (error) {
    console.error("Failed to delete rate:", error.message);
    return res.redirect(
      buildBookingDetailUrl(req.body.bookingId, {
        rate: "error",
        action: "delete",
      }),
    );
  }
};
