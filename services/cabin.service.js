import cabinDao from "../dao/cabin.dao.js";
import imageDao from "../dao/image.dao.js";
import rateDao from "../dao/rate.dao.js";
import { CabinSortFactory } from "../patterns/factory/cabin/factoryPattern.js";

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
  return strategy.apply(cabinDao.findAllQuery());
};

export const listCabinsPaginated = async ({
  sortType = "default",
  limit,
  offset,
}) => {
  const strategy = CabinSortFactory.getStrategy(sortType);
  return strategy.apply(cabinDao.findPaginated({ limit, offset }));
};

export const countCabins = async () => {
  const result = await cabinDao.countAll();
  return Number(result?.total || 0);
};

export const listManageCabins = async () => {
  // TODO: When cabins has ownerId, filter by current cabinOwner.
  const cabins = await cabinDao.findAll();
  return Array.isArray(cabins) ? cabins.filter(Boolean) : [];
};

export const getCabinById = async (id) => {
  return cabinDao.findById(id);
};

export const getCabinDetail = async (id) => {
  const cabin = await cabinDao.findById(id);
  if (!cabin) return null;

  const [rates, images] = await Promise.all([
    rateDao.findByCabinId(id),
    imageDao.findByCabinId(id),
  ]);

  const totalRating = rates.reduce((sum, item) => sum + Number(item.rating || 0), 0);

  return {
    cabin,
    rates,
    images,
    avgRating: rates.length ? (totalRating / rates.length).toFixed(1) : null,
    hasRates: rates.length > 0,
  };
};

export const createCabin = async ({ body, file }) => {
  return cabinDao.create(buildCabinPayload(body, file));
};

export const updateCabin = async ({ id, body, file }) => {
  const cabin = await cabinDao.findById(id);
  if (!cabin) return null;

  return cabinDao.update(id, buildCabinPayload(body, file, cabin));
};

export const deleteCabin = async (id) => {
  return cabinDao.delete(id);
};

export const duplicateCabin = async (id) => {
  return cabinDao.duplicateById(id);
};
