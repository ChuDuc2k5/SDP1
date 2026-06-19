import imageDao from "../dao/image.dao.js";
import { CabinImage } from "../models/image.model.js";

export const findImagesByCabinId = async (cabinId) => {
  const images = await imageDao.findByCabinId(cabinId);
  return images.map((image) => CabinImage.fromRow(image).toJSON());
};

export default {
  findImagesByCabinId,
};
