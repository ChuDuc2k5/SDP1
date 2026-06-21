import * as bookingService from "../services/booking.service.js";
import * as bookingPolicyService from "../services/bookingPolicy.service.js";
import * as cabinService from "../services/cabin.service.js";
import * as imageService from "../services/image.service.js";
import * as rateService from "../services/rate.service.js";

const toDateOnly = (value) => {
  if (!value) return null;
  const date = new Date(String(value).includes("T") ? value : `${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

const isUpcomingBooking = (booking) => {
  const endDate = toDateOnly(booking?.endDate);
  const today = toDateOnly(new Date());

  return Boolean(
    endDate &&
      today &&
      !["cancelled", "checked-out"].includes(booking.status) &&
      endDate >= today,
  );
};

export const getCabinsPageData = async (query = {}, currentUser = null) => {
  return cabinService.getPublicCabinsPageData(query, currentUser);
};

export const getCabinDetailPageData = async (cabinId, currentUser = null) => {
  const cabin = await cabinService.getCabinById(cabinId, currentUser);
  if (!cabin) return null;

  const [rates, images, bookingPolicy] = await Promise.all([
    rateService.findRatesByCabinId(cabinId),
    imageService.findImagesByCabinId(cabinId),
    bookingPolicyService.findBookingPolicyByCabinId(cabinId),
  ]);
  const totalRating = rates.reduce(
    (sum, item) => sum + Number(item.rating || 0),
    0,
  );

  return {
    cabin,
    rates,
    images,
    bookingPolicy: bookingPolicy?.toJSON?.() || bookingPolicy || null,
    avgRating: rates.length ? (totalRating / rates.length).toFixed(1) : null,
    hasRates: rates.length > 0,
  };
};

export const getCabinManagementPageData = async (
  currentUser,
  query = {},
) => ({
  cabins: await cabinService.listManageCabins(currentUser, query),
});

export const createCabin = async (currentUser, data) => {
  return cabinService.createCabin(data);
};

export const updateCabin = async (currentUser, cabinId, data) => {
  return cabinService.updateCabin({ ...data, id: cabinId });
};

export const deleteCabin = async (currentUser, cabinId) => {
  return cabinService.deleteCabin(cabinId);
};

export const duplicateCabin = async (currentUser, cabinId) => {
  return cabinService.duplicateCabin(cabinId);
};

export const getCabinActiveBookingCount = async (currentUser, cabinId) => {
  const bookings = await bookingService.listBookingsForUser(currentUser);
  return bookings.filter(
    (booking) => booking.cabinId === cabinId && isUpcomingBooking(booking),
  ).length;
};

export default {
  getCabinsPageData,
  getCabinDetailPageData,
  getCabinManagementPageData,
  createCabin,
  updateCabin,
  deleteCabin,
  duplicateCabin,
  getCabinActiveBookingCount,
};
