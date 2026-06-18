import settingModel from "../models/setting.model.js";

export const getCurrentSettings = () => settingModel.getCurrent();

export const updateCurrentSettings = (payload) => {
  return settingModel.updateCurrent({
    breakfastPrice: payload.breakfastPrice,
    miniBookingLength: payload.miniBookingLength || payload.minBookingLength,
    maxBookingLength: payload.maxBookingLength,
    maxNumberOfGuests: payload.maxNumberOfGuests || payload.maxGuests,
  });
};
