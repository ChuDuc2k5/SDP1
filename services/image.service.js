import imageDao from "../dao/image.dao.js";
import { CabinImage } from "../models/image.model.js";

export const findImagesByCabinId = async (cabinId) => {
  const images = await imageDao.findByCabinId(cabinId);
  return images.map((image) => CabinImage.fromRow(image).toJSON());
};

export const findCoverImageByCabinId = async (cabinId) => {
  const image = await imageDao.findCoverByCabinId(cabinId);
  return CabinImage.fromRow(image)?.toJSON() || null;
};

export const createImage = async (data) => {
  const image = await imageDao.create(data);
  return CabinImage.fromRow(image)?.toJSON() || null;
};

export const updateImage = async (id, data) => {
  const image = await imageDao.update(id, data);
  return CabinImage.fromRow(image)?.toJSON() || null;
};

export const deleteImage = async (id) => {
  return imageDao.delete(id);
};

export default {
  findImagesByCabinId,
  findCoverImageByCabinId,
  createImage,
  updateImage,
  deleteImage,
};
