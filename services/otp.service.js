import {
  createOTP,
  deleteOTPByEmail,
  getOTPByEmail,
} from "../dao/otp.dao.js";
import { Otp } from "../models/otp.model.js";

export const deleteOtpByEmail = (email) => deleteOTPByEmail(email);

export const createOtp = (data) => createOTP(data);

export const getOtpByEmail = async (email) => {
  const record = await getOTPByEmail(email);
  return Otp.fromRow(record);
};

export default {
  deleteOtpByEmail,
  createOtp,
  getOtpByEmail,
};
