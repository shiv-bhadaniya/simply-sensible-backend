import sgMail from "@sendgrid/mail";
import nodemailer from "nodemailer";

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Configure Nodemailer as fallback
const transporter = nodemailer.createTransporter({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOrderConfirmationEmail = async (req, res) => {
  try {
    const { orderId, customerEmail, orderDetails } = req.body;

    const msg = {
      to: customerEmail,
      from: process.env.MAIL_FROM,
      subject: "Order Confirmation - Simply Sensible",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Order Confirmation</h2>
          <p>Dear Customer,</p>
          <p>Thank you for your order! Your order has been confirmed and will be delivered within 7 days.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0;">
            <h3>Order Details:</h3>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Total Amount:</strong> ₹${orderDetails.totalAmount}</p>
            <p><strong>Order Date:</strong> ${orderDetails.paidAt}</p>
            <p><strong>Status:</strong> ${orderDetails.orderStatus}</p>
          </div>
          
          <div style="background-color: #e8f5e8; padding: 15px; margin: 20px 0;">
            <h3>Shipping Information:</h3>
            <p><strong>Name:</strong> ${orderDetails.shipingInfo.name}</p>
            <p><strong>Address:</strong> ${orderDetails.shipingInfo.address}</p>
            <p><strong>City:</strong> ${orderDetails.shipingInfo.city}, ${orderDetails.shipingInfo.state}</p>
            <p><strong>Pincode:</strong> ${orderDetails.shipingInfo.pinCode}</p>
            <p><strong>Phone:</strong> ${orderDetails.shipingInfo.phoneNo}</p>
          </div>
          
          <p>If you have any questions, please contact us at:</p>
          <p>Email: support@simplysensible.in</p>
          <p>Phone: +91-XXXXXXXXXX</p>
          
          <p>Best regards,<br>Simply Sensible Team</p>
        </div>
      `,
    };

    await sgMail.send(msg);
    console.log("Order confirmation email sent successfully");
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("SendGrid error:", error);
    
    // Fallback to Nodemailer
    try {
      await sendOrderConfirmationFallback(req.body);
      res.status(200).json({ message: "Email sent via fallback method" });
    } catch (fallbackError) {
      console.error("Fallback email error:", fallbackError);
      res.status(500).json({ message: "Failed to send email" });
    }
  }
};

export const sendOrderStatusUpdateEmail = async (req, res) => {
  try {
    const { customerEmail, orderId, newStatus, orderDetails } = req.body;

    const statusMessages = {
      "Processing": "Your order is being processed",
      "Shipped": "Your order has been shipped and is on its way",
      "Delivered": "Your order has been delivered successfully",
      "Cancelled": "Your order has been cancelled"
    };

    const msg = {
      to: customerEmail,
      from: process.env.MAIL_FROM,
      subject: `Order Status Update - ${newStatus}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Order Status Update</h2>
          <p>Dear Customer,</p>
          <p>${statusMessages[newStatus] || `Your order status has been updated to ${newStatus}`}.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0;">
            <h3>Order Details:</h3>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>New Status:</strong> ${newStatus}</p>
            <p><strong>Total Amount:</strong> ₹${orderDetails.totalAmount}</p>
          </div>
          
          <p>Thank you for choosing Simply Sensible!</p>
          <p>Best regards,<br>Simply Sensible Team</p>
        </div>
      `,
    };

    await sgMail.send(msg);
    console.log("Order status update email sent successfully");
    res.status(200).json({ message: "Status update email sent successfully" });
  } catch (error) {
    console.error("SendGrid error:", error);
    res.status(500).json({ message: "Failed to send status update email" });
  }
};

export const sendWelcomeEmail = async (req, res) => {
  try {
    const { customerEmail, customerName } = req.body;

    const msg = {
      to: customerEmail,
      from: process.env.MAIL_FROM,
      subject: "Welcome to Simply Sensible!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Simply Sensible!</h2>
          <p>Dear ${customerName},</p>
          <p>Thank you for joining Simply Sensible! We're excited to have you as part of our community.</p>
          
          <div style="background-color: #e8f5e8; padding: 15px; margin: 20px 0;">
            <h3>What's Next?</h3>
            <ul>
              <li>Browse our amazing products</li>
              <li>Enjoy fast and secure checkout</li>
              <li>Get your orders delivered within 7 days</li>
              <li>24/7 customer support</li>
            </ul>
          </div>
          
          <p>If you have any questions, feel free to contact us at support@simplysensible.in</p>
          
          <p>Happy Shopping!<br>Simply Sensible Team</p>
        </div>
      `,
    };

    await sgMail.send(msg);
    console.log("Welcome email sent successfully");
    res.status(200).json({ message: "Welcome email sent successfully" });
  } catch (error) {
    console.error("SendGrid error:", error);
    res.status(500).json({ message: "Failed to send welcome email" });
  }
};

// Fallback email function using Nodemailer
const sendOrderConfirmationFallback = async (orderData) => {
  const { orderId, customerEmail, orderDetails } = orderData;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: customerEmail,
    subject: "Order Confirmation - Simply Sensible",
    html: `
      <h2>Order Confirmation</h2>
      <p>Your order ${orderId} has been confirmed and will be delivered within 7 days.</p>
      <p>Total Amount: ₹${orderDetails.totalAmount}</p>
      <p>Thank you for your business!</p>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log("Fallback email sent successfully");
};
