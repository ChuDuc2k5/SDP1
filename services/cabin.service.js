import cabinDao from "../dao/cabin.dao.js";
import { Cabin } from "../models/cabin.model.js";
import { CabinSortFactory } from "../patterns/factory/cabin/factoryPattern.js";
import { findImagesByCabinId } from "./image.service.js";
import { findRatesByCabinId } from "./rate.service.js";

const CABINS_PER_PAGE = 9;

const toCabinView = (row) => Cabin.fromRow(row)?.toJSON();

const parsePage = (value) => {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
};

const buildBaseQuery = (query = {}) => {
  return Object.entries(query).reduce((baseQuery, [key, value]) => {
    if (key !== "page") {
      baseQuery[key] = value;
    }
    return baseQuery;
  }, {});
};

const buildCabinPageUrl = (baseQuery, page) => {
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
  return `/cabins?${params.toString()}`;
};

export const buildPaginationItems = (
  currentPage,
  totalPages,
  baseQuery = {},
) => {
  const items = [];

  const addPage = (page) => {
    items.push({
      type: "page",
      value: page,
      isActive: page === currentPage,
      url: buildCabinPageUrl(baseQuery, page),
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

const buildPagination = ({ baseQuery, currentPage, totalPages }) => {
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
    prevPageUrl: buildCabinPageUrl(baseQuery, prevPage),
    nextPageUrl: buildCabinPageUrl(baseQuery, nextPage),
    showPagination: totalPages > 1,
    paginationItems: buildPaginationItems(currentPage, totalPages, baseQuery),
  };
};

const parsePositiveInt = (value, fieldName) => {
  const number = Number.parseInt(value, 10);
  if (!Number.isInteger(number) || number <= 0) {
    throw new Error(`${fieldName} must be greater than 0`);
  }
  return number;
};

const parseNonNegativeNumber = (value, fieldName) => {
  const number = Number(value ?? 0);
  if (Number.isNaN(number) || number < 0) {
    throw new Error(`${fieldName} must be greater than or equal to 0`);
  }
  return number;
};

const parsePositiveNumber = (value, fieldName) => {
  const number = Number(value);
  if (Number.isNaN(number) || number <= 0) {
    throw new Error(`${fieldName} must be greater than 0`);
  }
  return number;
};

const buildCabinPayload = (body, file, existingCabin = null) => {
  if (!body.name?.trim()) {
    throw new Error("Cabin name is required");
  }

  const image = file
    ? `/images/cabins/${file.filename}`
    : existingCabin?.image || "/images/aboutBackground.jpg";

  return {
    name: body.name.trim(),
    maxCapacity: parsePositiveInt(body.maxCapacity, "maxCapacity"),
    regularPrice: parsePositiveNumber(body.regularPrice, "regularPrice"),
    discount: parseNonNegativeNumber(body.discount, "discount"),
    description: body.description || "",
    location: body.location || existingCabin?.location || null,
    amenities: body.amenities || existingCabin?.amenities || null,
    image,
  };
};

export const listCabins = async (sortType = "default") => {
  const strategy = CabinSortFactory.getStrategy(sortType);
  const cabins = await strategy.apply(cabinDao.findAllQuery());
  return cabins.map(toCabinView);
};

export const listCabinsPaginated = async ({
  sortType = "default",
  limit,
  offset,
}) => {
  const strategy = CabinSortFactory.getStrategy(sortType);
  const cabins = await strategy.apply(cabinDao.findPaginated({ limit, offset }));
  return cabins.map(toCabinView);
};

export const countCabins = async () => {
  const result = await cabinDao.countAll();
  return Number(result?.total || 0);
};

export const listManageCabins = async () => {
  // TODO: When cabins has ownerId, filter by current cabinOwner.
  const cabins = await cabinDao.findAll();
  return Array.isArray(cabins) ? cabins.filter(Boolean).map(toCabinView) : [];
};

export const getCabinById = async (id) => {
  const cabin = await cabinDao.findById(id);
  return toCabinView(cabin);
};

export const getCabinDetail = async (id) => {
  const cabin = await cabinDao.findById(id);
  if (!cabin) return null;

  const [rates, images] = await Promise.all([
    findRatesByCabinId(id),
    findImagesByCabinId(id),
  ]);

  const totalRating = rates.reduce((sum, item) => sum + Number(item.rating || 0), 0);

  return {
    cabin: toCabinView(cabin),
    rates,
    images,
    avgRating: rates.length ? (totalRating / rates.length).toFixed(1) : null,
    hasRates: rates.length > 0,
  };
};

export const getPublicCabinsPageData = async (query = {}) => {
  const sortType = typeof query.sort === "string" ? query.sort : "default";
  const requestedPage = parsePage(query.page);
  const totalCabins = await countCabins();
  const totalPages = Math.max(Math.ceil(totalCabins / CABINS_PER_PAGE), 1);
  const currentPage = Math.min(requestedPage, totalPages);
  const offset = (currentPage - 1) * CABINS_PER_PAGE;
  const baseQuery = buildBaseQuery(query);
  const cabins = await listCabinsPaginated({
    sortType,
    limit: CABINS_PER_PAGE,
    offset,
  });
  const pagination = buildPagination({
    baseQuery,
    currentPage,
    totalPages,
  });

  return {
    cabins,
    empty: cabins.length === 0,
    activeSort: sortType,
    ...pagination,
  };
};

export const createCabin = async ({ body, file }) => {
  const cabin = await cabinDao.create(buildCabinPayload(body, file));
  return toCabinView(cabin);
};

export const updateCabin = async ({ id, body, file }) => {
  const cabin = await cabinDao.findById(id);
  if (!cabin) return null;

  const updated = await cabinDao.update(id, buildCabinPayload(body, file, cabin));
  return toCabinView(updated);
};

export const deleteCabin = async (id) => {
  return cabinDao.delete(id);
};

export const duplicateCabin = async (id) => {
  const cabin = await cabinDao.duplicateById(id);
  return toCabinView(cabin);
};
