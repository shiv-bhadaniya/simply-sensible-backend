import express from "express";
const router = express.Router();

import Stripe from "stripe";

import * as dotenv from "dotenv";
dotenv.config();

const stripe = Stripe(process.env.STRIPE_API_KEY);

export const paymentProcess = async (req, res) => {
  try {
    let myamount = req.body.amount;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: myamount,
      currency: "inr",
      receipt_email: req.user.email,
    });
    console.log("No error.");
    res
      .status(200)
      .json({ success: true, client_secret: paymentIntent.client_secret });
  } catch (e) {
    switch (e.type) {
      case "StripeCardError":
        console.error("A payment error occurred: ", e.message);
        break;
      case "StripeInvalidRequestError":
        console.error("An invalid request occurred.");
        break;
      case "ETIMEDOUT":
      case "ENOTFOUND":
        console.error("Network error: ", error.message);
      case "ECONNREFUSED":
        console.error("Connection refused : ", error.message);
      default:
        console.error("Another problem occurred, maybe unrelated to Stripe.");
        break;
    }
    res.status(402).json({ success: false, message: e?.message });
  }
};

export const sendStripAPIKey = async (req, res) => {
  res.status(200).json({ stripeApiKey: process.env.STRIPE_PUBLISHABLE_KEY });
};

export default router;
