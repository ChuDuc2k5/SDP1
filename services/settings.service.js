import settingDao from "../dao/setting.dao.js";
import { Setting } from "../models/setting.model.js";

const toSettingView = (row) => Setting.fromRow(row)?.toJSON();

export const getCurrentSettings = async () => {
  const settings = await settingDao.getCurrent();
  return toSettingView(settings);
};

export const updateCurrentSettings = async (payload) => {
  const updated = await settingDao.updateCurrent({
    breakfastPrice: payload.breakfastPrice,
    miniBookingLength: payload.miniBookingLength || payload.minBookingLength,
    maxBookingLength: payload.maxBookingLength,
    maxNumberOfGuests: payload.maxNumberOfGuests || payload.maxGuests,
  });

  return toSettingView(updated);
};
