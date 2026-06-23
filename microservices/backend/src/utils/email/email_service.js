
import { order_details } from "./order_details.js";
import { verifyEmail } from "./verifyEmail.js";
import { transporter } from './../../config/mailer.js';

export const sendEmail = async ({ to, otp, type, order }) => {
  await transporter.sendMail({
    from: `"ecommerce App" <nada.nasr436@gmail.com>`,
    to,
    subject: "Your OTP Code",
    html: type === "verifyEmail" ? verifyEmail(otp) : order_details(order),
  });
};