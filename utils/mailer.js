import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config({ quiet: true });

const isProduction = () => process.env.NODE_ENV === "production";

const getMailConfig = () => {
  const host =
    process.env.SMTP_HOST ||
    process.env.EMAIL_HOST ||
    process.env.MAIL_HOST ||
    "smtp.gmail.com";
  const port = Number(
    process.env.SMTP_PORT || process.env.EMAIL_PORT || process.env.MAIL_PORT || 587,
  );
  const user =
    process.env.SMTP_USER || process.env.EMAIL_USER || process.env.MAIL_USER;
  const pass =
    process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.MAIL_PASS;
  const from =
    process.env.SMTP_FROM ||
    process.env.EMAIL_FROM ||
    process.env.MAIL_FROM ||
    user;

  const missing = [];
  if (!user) missing.push("SMTP_USER or EMAIL_USER or MAIL_USER");
  if (!pass) missing.push("SMTP_PASS or EMAIL_PASS or MAIL_PASS");
  if (!from) missing.push("SMTP_FROM or EMAIL_FROM or MAIL_FROM");

  return {
    host,
    port,
    secure: port === 465,
    user,
    pass,
    from,
    missing,
  };
};

const logDevOtpFallback = ({ email, otp, reason }) => {
  console.error(`[mail] ${reason}`);
  console.log(`[mail] Development fallback enabled. OTP for ${email}: ${otp}`);
};

const createTransporter = (config) => {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
};

export const sendOTP = async (email, otp) => {
  const config = getMailConfig();

  if (config.missing.length > 0) {
    const reason = `Missing mail config: ${config.missing.join(", ")}`;

    if (!isProduction()) {
      logDevOtpFallback({ email, otp, reason });
      return { sent: false, fallback: true };
    }

    console.error(`[mail] ${reason}`);
    throw new Error("Email service is not configured. Please contact support.");
  }

  try {
    const transporter = createTransporter(config);
    await transporter.verify();
    console.log(`[mail] SMTP verified for ${config.host}:${config.port}`);

    await transporter.sendMail({
      from: config.from,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}`,
    });
    console.log(`[mail] OTP email sent to ${email}`);

    return { sent: true, fallback: false };
  } catch (err) {
    if (!isProduction()) {
      logDevOtpFallback({
        email,
        otp,
        reason: `Failed to send email via SMTP: ${err.message}`,
      });
      return { sent: false, fallback: true };
    }

    console.error(`[mail] Failed to send OTP email: ${err.message}`);
    throw new Error("Could not send OTP email. Please try again later.");
  }
};

export const sendOtpEmail = sendOTP;
