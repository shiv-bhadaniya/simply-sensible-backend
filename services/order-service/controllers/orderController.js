import moment from "moment";
import Order from "../models/Order.js";
import axios from "axios";

export const createOrder = async (req, res) => {
  const { shipingInfo, orderItems, totalAmount, paymetInfo, customerId, customerEmail } = req.body;

  const newOrder = new Order({
    shipingInfo,
    orderItems,
    paymetInfo,
    totalAmount,
    paidAt: moment().format("MMM Do YYYY"),
    customerId,
    customerEmail,
  });

  try {
    await newOrder.save();
    
    // Notify notification service about new order
    try {
      await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/notifications/order-confirmation`, {
        orderId: newOrder._id,
        customerEmail,
        orderDetails: newOrder
      });
    } catch (notificationError) {
      console.log("Failed to send notification:", notificationError.message);
    }

    // Update stock in product service
    try {
      await axios.post(`${process.env.PRODUCT_SERVICE_URL}/products/stock/update`, {
        orderItems
      });
    } catch (stockError) {
      console.log("Failed to update stock:", stockError.message);
      // Rollback order if stock update fails
      await Order.findByIdAndDelete(newOrder._id);
      return res.status(500).json({ message: "Failed to update stock" });
    }

    res.status(200).json({ order: newOrder });
  } catch (error) {
    console.error("Error creating new order:", error);
    res.status(500).json({ message: "Error creating order" });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const allOrders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(allOrders);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const { customerId } = req.params;
    const userOrders = await Order.find({ customerId }).sort({ createdAt: -1 });
    
    if (userOrders.length !== 0) {
      res.status(200).json(userOrders);
    } else {
      res.status(200).json({ message: "No orders yet." });
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, orderStatus } = req.body;
    console.log("Order before update : ", { orderId, orderStatus });

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { 
        orderStatus,
        ...(orderStatus === "Delivered" && { deliveredAt: new Date() })
      },
      { new: true },
    );
    
    console.log("Order After update status : ", updatedOrder);

    if (updatedOrder === null) {
      res.status(404).json({ message: "Order not found" });
    } else {
      res.status(200).json({ 
        message: "Order status updated successfully.",
        order: updatedOrder
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByIdAndDelete(orderId);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    res.status(200).json({ message: "Order deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong." });
  }
};
