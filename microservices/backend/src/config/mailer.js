import nodemailer from'nodemailer'
import dotenv from "dotenv";
dotenv.config();

  export const transporter = nodemailer.createTransport({
  service:'gmail',
  auth: {
    user: "nada.nasr436@gmail.com",
    pass: process.env.pass,
  },
});
