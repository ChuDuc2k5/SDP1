import settingDao from "../dao/setting.dao.js";

export const getCurrentSettings = () => settingDao.getCurrent();

export const updateCurrentSettings = (payload) => {
  return settingDao.updateCurrent({
    breakfastPrice: payload.breakfastPrice,
    miniBookingLength: payload.miniBookingLength || payload.minBookingLength,
    maxBookingLength: payload.maxBookingLength,
    maxNumberOfGuests: payload.maxNumberOfGuests || payload.maxGuests,
  });
};
