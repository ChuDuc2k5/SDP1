import cabinModel from "../models/cabin.model.js";
import imageModel from "../models/image.model.js";
import rateModel from "../models/rate.model.js";
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
  return strategy.apply(cabinModel.findAllQuery());
};

export const listManageCabins = async () => {
  // TODO: When cabins has ownerId, filter by current cabinOwner.
  const cabins = await cabinModel.findAll();
  return Array.isArray(cabins) ? cabins.filter(Boolean) : [];
};

export const getCabinById = async (id) => {
  return cabinModel.findById(id);
};

export const getCabinDetail = async (id) => {
  const cabin = await cabinModel.findById(id);
  if (!cabin) return null;

  const [rates, images] = await Promise.all([
    rateModel.findByCabinId(id),
    imageModel.findByCabinId(id),
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
  return cabinModel.create(buildCabinPayload(body, file));
};

export const updateCabin = async ({ id, body, file }) => {
  const cabin = await cabinModel.findById(id);
  if (!cabin) return null;

  return cabinModel.updateById(id, buildCabinPayload(body, file, cabin));
};

export const deleteCabin = async (id) => {
  return cabinModel.deleteById(id);
};

export const duplicateCabin = async (id) => {
  return cabinModel.duplicateById(id);
};
