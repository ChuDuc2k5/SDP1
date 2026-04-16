import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ndomquan05@gmail.com",
    pass: "jbec pvci qqag jvcr",
  },
});

export const sendOTP = async (email, otp) => {
  await transporter.sendMail({
    from: "ndomquan05@gmail.com",
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is: ${otp}`,
  });
};