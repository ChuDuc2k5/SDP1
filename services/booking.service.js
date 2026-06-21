import bookingDao from "../dao/booking.dao.js";
import { Booking } from "../models/booking.model.js";
import { Cabin } from "../models/cabin.model.js";
import { getUserId, ROLE, toViewUser } from "../utils/sessionUser.js";
import { findBookingPolicyByCabinId } from "./bookingPolicy.service.js";
import { getCabinById } from "./cabin.service.js";
import { findRateByBookingId } from "./rate.service.js";
import { getCurrentSettings } from "./setting.service.js";

const BOOKINGS_PER_PAGE = 6;
const CUSTOMER_EDIT_BLOCKED_STATUSES = ["checked-in", "checked-out"];
const OWNER_ALLOWED_STATUSES = [
  "unconfirmed",
  "confirmed",
  "checked-in",
  "checked-out",
  "cancelled",
  "pending",
];
const BOOKING_VIEWS = ["upcoming", "history"];
const STATUS_OPTIONS = [
  "unconfirmed",
  "pending",
  "confirmed",
  "checked-in",
  "checked-out",
  "cancelled",
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

  const date = new Date(
    String(value).includes("T") ? value : `${value}T00:00:00`,
  );
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
  const policy = await findBookingPolicyByCabinId(cabinId);
  if (policy?.breakfastPrice != null) {
    return Number(policy.breakfastPrice);
  }

  const settings = await getCurrentSettings();
  return Number(settings?.breakfastPrice || 15);
};

const buildPricing = async ({ cabin, startDate, endDate, numGuests, type, hasBreakfast }) => {
  const numNights = diffNights(startDate, endDate);
  const guests = Number(numGuests);
  const cabinEntity = new Cabin(cabin);

  if (!Number.isInteger(guests) || guests <= 0) {
    throw new Error("numGuests must be greater than 0");
  }

  if (!cabinEntity.canFitGuests(guests)) {
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

const parsePage = (value) => {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
};

const buildBaseQuery = (query = {}) => {
  return Object.entries(query).reduce((baseQuery, [key, value]) => {
    if (key !== "page" && key !== "success") {
      baseQuery[key] = value;
    }
    return baseQuery;
  }, {});
};

const readQueryString = (query, key) => {
  const value = query[key];
  return typeof value === "string" ? value.trim() : "";
};

const isValidDateInput = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime());
};

const buildOwnerFilters = (query = {}) => {
  const q = readQueryString(query, "q");
  const status = readQueryString(query, "status");
  const dateFrom = readQueryString(query, "dateFrom");
  const dateTo = readQueryString(query, "dateTo");

  return {
    q,
    status: STATUS_OPTIONS.includes(status) ? status : "",
    dateFrom: isValidDateInput(dateFrom) ? dateFrom : "",
    dateTo: isValidDateInput(dateTo) ? dateTo : "",
  };
};

const hasActiveFilters = (filters) =>
  Boolean(filters.q || filters.status || filters.dateFrom || filters.dateTo);

const buildPageUrl = (basePath, baseQuery, page) => {
  const params = new URLSearchParams();

  Object.entries(baseQuery).forEach(([key, value]) => {
    if (key === "page" || value === undefined || value === null || value === "") {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== "") {
          params.append(key, String(item));
        }
      });
      return;
    }

    if (typeof value !== "object") {
      params.set(key, String(value));
    }
  });

  params.set("page", String(page));
  return `${basePath}?${params.toString()}`;
};

const buildPaginationItems = (
  currentPage,
  totalPages,
  basePath,
  baseQuery = {},
) => {
  const items = [];

  const addPage = (page) => {
    items.push({
      type: "page",
      value: page,
      isActive: page === currentPage,
      url: buildPageUrl(basePath, baseQuery, page),
    });
  };

  const addEllipsis = () => {
    if (items[items.length - 1]?.type !== "ellipsis") {
      items.push({ type: "ellipsis" });
    }
  };

  if (totalPages <= 7) {
    for (let page = 1; page <= totalPages; page += 1) {
      addPage(page);
    }
    return items;
  }

  addPage(1);

  let start = Math.max(2, currentPage - 2);
  let end = Math.min(totalPages - 1, currentPage + 2);

  if (currentPage <= 2) {
    start = 2;
    end = 3;
  } else if (currentPage >= totalPages - 1) {
    start = totalPages - 2;
    end = totalPages - 1;
  }

  if (start > 2) {
    addEllipsis();
  }

  for (let page = start; page <= end; page += 1) {
    addPage(page);
  }

  if (end < totalPages - 1) {
    addEllipsis();
  }

  addPage(totalPages);
  return items;
};

const buildPagination = ({ basePath, baseQuery, currentPage, totalPages }) => {
  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;
  const prevPage = hasPrevPage ? currentPage - 1 : 1;
  const nextPage = hasNextPage ? currentPage + 1 : totalPages;

  return {
    currentPage,
    totalPages,
    hasPrevPage,
    hasNextPage,
    prevPage,
    nextPage,
    prevPageUrl: buildPageUrl(basePath, baseQuery, prevPage),
    nextPageUrl: buildPageUrl(basePath, baseQuery, nextPage),
    showPagination: totalPages > 1,
    paginationItems: buildPaginationItems(
      currentPage,
      totalPages,
      basePath,
      baseQuery,
    ),
  };
};

const toBookingView = (row) => Booking.fromRow(row)?.toJSON();

export const listBookingsForUser = async (currentUser) => {
  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  if (currentUser.role === ROLE.CABIN_OWNER) {
    // TODO: When cabins has ownerId, restrict owners to bookings for their cabins.
    const bookings = await bookingDao.findAll();
    return bookings.map(toBookingView);
  }

  const userId = getUserId(currentUser);
  if (!userId) {
    throw new Error("userId is required");
  }

  const bookings = await bookingDao.findByUserId(userId);
  return bookings.map(toBookingView);
};

export const listBookingsForUserPaginated = async (
  currentUser,
  { view = "upcoming", filters = {}, limit, offset },
) => {
  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  const userId = getUserId(currentUser);
  if (!userId) {
    throw new Error("userId is required");
  }

  if (currentUser.role === ROLE.CABIN_OWNER) {
    // Current schema has no cabin owner relation, so keep the existing owner scope.
    const bookings =
      view === "history"
        ? await bookingDao.findHistoryForCabinOwnerPaginated(
            userId,
            filters,
            limit,
            offset,
          )
      : await bookingDao.findUpcomingForCabinOwnerPaginated(
          userId,
          filters,
          limit,
          offset,
        );

    return bookings.map(toBookingView);
  }

  const bookings =
    view === "history"
      ? await bookingDao.findHistoryByUserIdPaginated(userId, limit, offset)
      : await bookingDao.findUpcomingByUserIdPaginated(userId, limit, offset);

  return bookings.map(toBookingView);
};

export const countBookingsForUser = async (
  currentUser,
  { view = "upcoming", filters = {} } = {},
) => {
  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  const userId = getUserId(currentUser);
  if (!userId) {
    throw new Error("userId is required");
  }

  if (currentUser.role === ROLE.CABIN_OWNER) {
    // Current schema has no cabin owner relation, so keep the existing owner scope.
    const result =
      view === "history"
        ? await bookingDao.countHistoryForCabinOwner(userId, filters)
        : await bookingDao.countUpcomingForCabinOwner(userId, filters);
    return Number(result?.total || 0);
  }

  const result =
    view === "history"
      ? await bookingDao.countHistoryByUserId(userId)
      : await bookingDao.countUpcomingByUserId(userId);
  return Number(result?.total || 0);
};

export const normalizeBookingView = (view) =>
  BOOKING_VIEWS.includes(view) ? view : "upcoming";

export const getBookingPageData = async (currentUser, query = {}) => {
  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  const requestedPage = parsePage(query.page);
  const activeView = normalizeBookingView(query.view);
  const isCabinOwner = currentUser.role === ROLE.CABIN_OWNER;
  const ownerFilters = isCabinOwner ? buildOwnerFilters(query) : {};
  const totalBookings = await countBookingsForUser(currentUser, {
    view: activeView,
    filters: ownerFilters,
  });
  const totalPages = Math.max(Math.ceil(totalBookings / BOOKINGS_PER_PAGE), 1);
  const currentPage = Math.min(requestedPage, totalPages);
  const offset = (currentPage - 1) * BOOKINGS_PER_PAGE;
  const baseQuery = {
    ...buildBaseQuery(query),
    view: activeView,
  };
  const bookings = await listBookingsForUserPaginated(currentUser, {
    view: activeView,
    filters: ownerFilters,
    limit: BOOKINGS_PER_PAGE,
    offset,
  });
  const pagination = buildPagination({
    basePath: "/booking",
    baseQuery,
    currentPage,
    totalPages,
  });
  const filterActive = isCabinOwner && hasActiveFilters(ownerFilters);
  const isHistoryView = activeView === "history";
  const upcomingUrl = buildPageUrl(
    "/booking",
    { ...baseQuery, view: "upcoming" },
    1,
  );
  const historyUrl = buildPageUrl(
    "/booking",
    { ...baseQuery, view: "history" },
    1,
  );

  return {
    bookings,
    empty: bookings.length === 0,
    isAdmin: isCabinOwner,
    isCabinOwner,
    isCustomer: currentUser.role === ROLE.CUSTOMER,
    success: query.success === "1",
    activeView,
    isUpcomingView: !isHistoryView,
    isHistoryView,
    upcomingUrl,
    historyUrl,
    clearFiltersUrl: `/booking?view=${activeView}`,
    ownerFilters,
    filterActive,
    statusOptions: STATUS_OPTIONS.map((status) => ({
      value: status,
      label: status,
      selected: status === ownerFilters.status,
    })),
    emptyTitle: filterActive
      ? "No bookings match your filters."
      : isHistoryView
        ? "No booking history found."
        : "No upcoming bookings found.",
    emptySubtitle: isHistoryView
      ? "Cancelled, checked-out, and past bookings will appear here."
      : "Upcoming bookings exclude cancelled, checked-out, and past stays.",
    totalBookings,
    pageLimit: BOOKINGS_PER_PAGE,
    ...pagination,
  };
};

export const getBookingDetail = async (currentUser, bookingId) => {
  if (!isUuid(bookingId)) {
    throw new Error("Booking not found or unauthorized");
  }

  const booking = await bookingDao.findById(bookingId);
  assertAuthorized(currentUser, booking);
  return toBookingView(booking);
};

export const getBookingDetailPageData = async (
  currentUser,
  bookingId,
  query = {},
) => {
  const booking = await getBookingDetail(currentUser, bookingId);
  const existingRate = await findRateByBookingId(bookingId);
  const canRate =
    currentUser.role === ROLE.CUSTOMER &&
    booking.userId === getUserId(currentUser) &&
    booking.status === "checked-out" &&
    !existingRate;

  return {
    booking,
    existingRate,
    canRate,
    rateSuccess: query.rate === "success",
    rateError: query.rate === "error",
  };
};

export const getBookingEditPageData = async (currentUser, bookingId) => {
  const booking = await getBookingDetail(currentUser, bookingId);

  return {
    booking,
    currentUser: toViewUser(currentUser),
  };
};

export const getCabinForNewBooking = async (currentUser, cabinId) => {
  assertCustomer(currentUser);

  if (!isUuid(cabinId)) {
    throw new Error("Cabin not found");
  }

  const cabin = await getCabinById(cabinId);
  if (!cabin) {
    throw new Error("Cabin not found");
  }

  return cabin;
};

export const getNewBookingPageData = async (currentUser, cabinId) => {
  const cabin = await getCabinForNewBooking(currentUser, cabinId);

  return {
    cabin,
    currentUser: toViewUser(currentUser),
  };
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

  const cabin = await getCabinById(cabinId);
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

  const hasOverlap = await bookingDao.hasOverlap({ cabinId, startDate, endDate });
  if (hasOverlap) {
    throw new Error("Cabin is not available for the selected dates");
  }

  return bookingDao.create({
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

  const hasOverlap = await bookingDao.hasOverlap({
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

  return bookingDao.update(bookingId, updateData);
};

export const cancelBooking = async (currentUser, bookingId) => {
  const booking = await getBookingDetail(currentUser, bookingId);
  const bookingEntity = new Booking(booking);

  if (bookingEntity.isCheckedOut()) {
    throw new Error("Checked-out booking cannot be cancelled");
  }

  return bookingDao.update(bookingId, { status: "cancelled" });
};
