import express from "express";
const router = express.Router();

import Stripe from "stripe";

const stripe = Stripe(process.env.STRIPE_API_KEY)

export const paymentProcess = async (req, res) => {

        let myamount = req.body.amount;
        const paymentIntent = await stripe.paymentIntents.create({
            amount: myamount,
            currency: 'inr',
            receipt_email: req.user.email,
        });

        res.status(200).json({ success: true, client_secret: paymentIntent.client_secret });
}

export const sendStripAPIKey = async (req, res) => {


    res.status(200).json({ stripeApiKey: "pk_test_51MNE0xSFQdCBkgTczfMehE6NOHpYmjk4n9BwCzWYDXVO5lVYpjEoXaiFDBndrmoa9VWU3Q6Kr3IRQhxIiVBJc0yX00Z0wHXvFx" });

}

export default router;