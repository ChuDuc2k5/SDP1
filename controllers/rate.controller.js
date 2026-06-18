import {
  createRateForBooking,
  findRatesByCabinId,
} from "../services/rate.service.js";

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
