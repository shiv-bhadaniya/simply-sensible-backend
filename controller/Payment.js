import express from "express";
const router = express.Router();

import Stripe from "stripe";

import * as dotenv from "dotenv";
dotenv.config();

const stripe = Stripe(process.env.STRIPE_API_KEY);

export const paymentProcess = async (req, res) => {
  let myamount = req.body.amount;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: myamount,
    currency: "inr",
    receipt_email: req.user.email,
  });

  res
    .status(200)
    .json({ success: true, client_secret: paymentIntent.client_secret });
};

export const sendStripAPIKey = async (req, res) => {
  res.status(200).json({ stripeApiKey: process.env.STRIPE_PUBLISHABLE_KEY });
};

export default router;
