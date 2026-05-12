// lib/auth.ts
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { nextCookies } from "better-auth/next-js"
import prisma from "./prisma"
import { hash, compare } from "bcryptjs"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    password: {
      hash: async (pass) => {
        return await hash(pass, 10)
      },
      verify: async ({ hash, password }) => {
        return await compare(password, hash)
      },
    },
    sendResetPassword: async ({ user, url }) => {
      if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        try {
          const transporter = (await import("nodemailer")).createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false, // true for 465, false for other ports
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });

          await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Train System" <noreply@example.com>',
            to: user.email,
            subject: "Reset your password",
            html: `
              <h1>Reset Password</h1>
              <p>Click the link below to reset your password:</p>
              <a href="${url}">${url}</a>
              <p>If you didn't request this, please ignore this email.</p>
            `,
          });
          console.log(`Email sent to ${user.email}`);
        } catch (error) {
          console.error("Error sending email:", error);
        }
      } else {
        // If SMTP is not configured, log the reset link to the console
        console.log("----------------------------------------")
        console.log(`Reset Password Link for ${user.email}:`)
        console.log(url)
        console.log("----------------------------------------")
      }
    },
  },
  user: {
    additionalFields: {
      phoneNumber: {
        type: "string",
      },
    },
  },
  plugins: [
    nextCookies()
  ],
  secret: process.env.BETTER_AUTH_SECRET,
})