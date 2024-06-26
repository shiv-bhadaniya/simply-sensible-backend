import express from "express";
import moment from "moment";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import nodemailer from "nodemailer";
import { sendOrderConfirmationMail } from "../util/sendMail.js";

const router = express.Router();

export const getAllProducts = async (req, res) => {
  try {
    const allProducts = await Product.find();
    res.status(200).json(allProducts);
  } catch (error) {
    res.json("Error");
  }
};

export const cartPriceCalulate = async (req, res) => {
  const cartItems = req.body;

  try {
    var cartItemsIds = [];

    // find all ides of cart items so we can perfom find
    for (let i = 0; i < cartItems.length; i++) {
      let itemId = cartItems[i]._id;
      cartItemsIds.push(itemId);
    }

    console.log("cartitem ids : ", cartItemsIds);

    let dbProduct = await Product.find({
      _id: {
        $in: cartItemsIds,
      },
    });

    if (dbProduct.length !== cartItems.length) {
      throw new Error("Product not find.");
    }
    // check stock availability
    for (let i = 0; i < cartItems.length; i++) {
      const product = dbProduct.find((p) => p._id == cartItems[i]._id);

      if (product && product.stocks < cartItems[i].quantity) {
        console.error(`Not enough stock for product ${product.name}`);
        return res
          .status(301)
          .json(`Not enough stock for product ${product.name}`);
      } else {
        console.info("barabr stock availability...");
      }
    }

    var subTotal = 0;

    for (let i = 0; i < cartItems.length; i++) {
      for (let j = 0; j < dbProduct.length; j++) {
        if (cartItems[i]._id == dbProduct[j]._id) {
          let onItemPrice = dbProduct[j].price * cartItems[i].quantity;
          subTotal = subTotal + onItemPrice;
        }
      }
    }

    var total = subTotal + 80;

    console.log("calculate with db. Total with other charges :", total);

    res.status(200).json(total);
  } catch (error) {
    res.status(500).json(error);
  }
};

const updateStock = async (orderItems) => {
  const bulkOperations = orderItems.map((item) => {
    return {
      updateOne: {
        filter: { _id: item._id },
        update: { $inc: { stocks: -item.quantity } },
      },
    };
  });

  try {
    await Product.bulkWrite(bulkOperations);
    console.log("Stock updated successfully");
    return true;
  } catch (error) {
    console.error("Error updating stock:", error);
    return false;
  }
};

export const newOrder = async (req, res) => {
  const { shipingInfo, orderItems, totalAmount, paymetInfo } = req.body;

  const newOrder = new Order({
    shipingInfo,
    orderItems,
    paymetInfo,
    totalAmount,
    paidAt: moment().format("MMM Do YYYY"),
    customerId: req.user._id,
    customerEmail: req.user.email,
  });

  try {
    newOrder.save();
    sendOrderConfirmationMail(newOrder);

    const stockUpdated = await updateStock(orderItems);
    if (!stockUpdated) {
      throw new Error("Failed to update stock");
    }

    res.status(200).json({ newOrder });
  } catch (error) {
    console.error("Error creating new order:", error);
    res.json({ message: error });
  }
};

export const fetchAllUserOrders = async (req, res) => {
  try {
    let userId = req.user._id;

    const userOrders = await Order.find({ user: userId });
    if (userOrders.length !== 0) {
      res.status(200).json(userOrders);
    } else {
      res.status(200).json("Not order yet.");
    }
  } catch (error) {
    res.status(500).json("Something went wrog.");
  }
};

// new product review
export const newProductReview = async (req, res) => {
  const productId = req.params.productId;
  const reviewData = req.body;

  try {
    const updatedProductWithReviews = await Product.findByIdAndUpdate(
      productId,
      {
        $push: {
          reviews: {
            rating: reviewData?.rating,
            review: reviewData?.review,
            user: {
              userId: reviewData?.user?.userId,
              name: reviewData?.user?.name,
              email: reviewData?.user?.email,
            },
            date: moment().format("MMM Do YYYY"),
          },
        },
      },
      { new: true },
    );

    const product = await Product.findById(productId);
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json("Something went wrong..");
  }
};

// get product details
export const getProductDetails = async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);
    if (product !== null) {
      res.status(200).json(product);
    } else {
      res.status(200).json("we face problem while fetching product details.");
    }
  } catch (error) {
    res.status(500).json("Something went wrong.");
  }
};

export default router;
