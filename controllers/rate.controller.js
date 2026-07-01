import {
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
    const createdRate = await createRateForBooking(req.currentUser, req.body);
    return res.redirect(`/booking/detail/${createdRate.bookingId}?rate=success`);
  } catch (error) {
    console.error("Failed to submit rate:", error.message);
    return res.redirect(`/booking/detail/${req.body.bookingId}?rate=error`);
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
