import Stripe from "stripe";
import axios from "axios";

const stripe = Stripe(process.env.STRIPE_API_KEY);

export const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = "inr", customerEmail } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      receipt_email: customerEmail,
      metadata: {
        service: "ecommerce-payment"
      }
    });
    
    console.log("Payment intent created successfully");
    res.status(200).json({ 
      success: true, 
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id
    });
  } catch (e) {
    console.error("Payment error:", e);
    
    switch (e.type) {
      case "StripeCardError":
        console.error("A payment error occurred: ", e.message);
        break;
      case "StripeInvalidRequestError":
        console.error("An invalid request occurred.");
        break;
      case "ETIMEDOUT":
      case "ENOTFOUND":
        console.error("Network error: ", e.message);
        break;
      case "ECONNREFUSED":
        console.error("Connection refused : ", e.message);
        break;
      default:
        console.error("Another problem occurred, maybe unrelated to Stripe.");
        break;
    }
    res.status(402).json({ success: false, message: e?.message });
  }
};

export const getStripeApiKey = async (req, res) => {
  res.status(200).json({ 
    stripeApiKey: process.env.STRIPE_PUBLISHABLE_KEY 
  });
};

export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === "succeeded") {
      res.status(200).json({ 
        success: true, 
        paymentStatus: "succeeded",
        paymentIntent: paymentIntent
      });
    } else {
      res.status(400).json({ 
        success: false, 
        paymentStatus: paymentIntent.status,
        message: "Payment not completed"
      });
    }
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error confirming payment" 
    });
  }
};

export const refundPayment = async (req, res) => {
  try {
    const { paymentIntentId, amount } = req.body;
    
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount, // Amount in cents
    });
    
    res.status(200).json({ 
      success: true, 
      refund: refund
    });
  } catch (error) {
    console.error("Error processing refund:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error processing refund" 
    });
  }
};

export const getPaymentHistory = async (req, res) => {
  try {
    const { customerEmail } = req.query;
    
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 100,
    });
    
    // Filter by customer email if provided
    const filteredPayments = customerEmail 
      ? paymentIntents.data.filter(payment => payment.receipt_email === customerEmail)
      : paymentIntents.data;
    
    res.status(200).json({ 
      success: true, 
      payments: filteredPayments
    });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching payment history" 
    });
  }
};
