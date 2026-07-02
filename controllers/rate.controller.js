import {
  deleteRating,
  getRatesByCabin,
  submitRating,
  updateRating,
} from "../facades/rate.facade.js";

const bookingDetailUrl = (bookingId, query) => {
  if (!bookingId) return "/booking";
  return `/booking/detail/${encodeURIComponent(bookingId)}?${query}`;
};

const rateFailureQuery = (action, error) => {
  let reason = "unexpected";
  if (error.status === 400) reason = "invalid";
  if (error.status === 403) reason = "forbidden";
  if (error.status === 404) reason = "not-found";

  return `rate=error&action=${action}&reason=${reason}`;
};

export const listRatesByCabin = async (req, res) => {
  try {
    const { rates } = await getRatesByCabin(req.params.cabinId);

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
    const createdRate = await submitRating(
      req.currentUser,
      req.body.bookingId,
      req.body,
    );
    return res.redirect(`/booking/detail/${createdRate.bookingId}?rate=success`);
  } catch (error) {
    console.error("Failed to submit rate:", error.message);
    return res.redirect(`/booking/detail/${req.body.bookingId}?rate=error`);
  }
};

export const submitRateJson = async (req, res) => {
  try {
    const createdRate = await submitRating(
      req.currentUser,
      req.body.bookingId,
      req.body,
    );

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
    const updatedRate = await updateRating(
      req.currentUser,
      req.params.ratingId,
      req.body,
    );

    return res.redirect(
      bookingDetailUrl(updatedRate.bookingId, "rate=updated"),
    );
  } catch (error) {
    console.error("Failed to update rate:", error.message);
    return res.redirect(
      bookingDetailUrl(
        req.body.bookingId,
        rateFailureQuery("update", error),
      ),
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
      bookingDetailUrl(deletedRate.bookingId, "rate=deleted"),
    );
  } catch (error) {
    console.error("Failed to delete rate:", error.message);
    return res.redirect(
      bookingDetailUrl(
        req.body.bookingId,
        rateFailureQuery("delete", error),
      ),
    );
  }
};
