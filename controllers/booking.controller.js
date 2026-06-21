import {
  cancelBooking,
  createBooking,
  getBookingDetailPageData,
  getBookingEditPageData,
  getBookingPageData,
  getNewBookingPageData,
  updateBooking,
} from "../facades/booking.facade.js";

export const listBookings = async (req, res) => {
  try {
    const pageData = await getBookingPageData(req.currentUser, req.query);
    res.render("vxBooking/booking", pageData);
  } catch (error) {
    console.error("Failed to list bookings:", error.message);
    res.status(500).send("Internal Server Error");
  }
};

export const redirectDetail = (req, res) => {
  res.redirect("/booking/");
};

export const showBookingDetail = async (req, res) => {
  try {
    const pageData = await getBookingDetailPageData(
      req.currentUser,
      req.params.id,
      req.query,
    );

    res.render("vxBooking/booking-detail", pageData);
  } catch (error) {
    console.error("Failed to load booking detail:", error.message);
    res.status(404).send("Booking not found or unauthorized");
  }
};

export const renderNewBooking = async (req, res) => {
  try {
    const pageData = await getNewBookingPageData(
      req.currentUser,
      req.params.cabinId,
    );

    res.render("vxBooking/newbooking", pageData);
  } catch (error) {
    if (error.message === "Unauthorized") {
      return res.redirect("/auth/login");
    }

    if (error.message === "Only customers can create bookings") {
      return res.status(403).send("Forbidden");
    }

    console.error("Failed to open booking form:", error.message);
    res.redirect("/cabins");
  }
};

export const storeBooking = async (req, res) => {
  try {
    await createBooking(req.currentUser, req.body);
    res.redirect("/booking/?success=1");
  } catch (error) {
    console.error("Failed to create booking:", error.message);
    res.status(400).send(error.message);
  }
};

export const renderEditBooking = async (req, res) => {
  try {
    const pageData = await getBookingEditPageData(req.currentUser, req.params.id);
    res.render("vxBooking/editbooking", pageData);
  } catch (error) {
    console.error("Failed to load booking edit:", error.message);
    res.status(404).send("Booking not found or unauthorized");
  }
};

export const saveBooking = async (req, res) => {
  try {
    const updatedBooking = await updateBooking(req.currentUser, req.params.id, req.body);

    if (!updatedBooking) {
      return res.status(404).send("Booking not found or unauthorized");
    }

    res.redirect(`/booking/detail/${updatedBooking._id}`);
  } catch (error) {
    console.error("Failed to update booking:", error.message);
    res.status(400).send(error.message);
  }
};

export const cancelBookingById = async (req, res) => {
  try {
    const cancelledBooking = await cancelBooking(req.currentUser, req.params.id);

    if (!cancelledBooking) {
      return res.status(404).send("Booking not found or unauthorized");
    }

    res.redirect("/booking/");
  } catch (error) {
    console.error("Failed to cancel booking:", error.message);
    res.status(400).send(error.message);
  }
};
