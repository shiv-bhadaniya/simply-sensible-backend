import moment from "moment";
import Product from "../models/Product.js";

export const getAllProducts = async (req, res) => {
  try {
    const allProducts = await Product.find();
    res.status(200).json(allProducts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);
    if (product !== null) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const createProduct = async (req, res) => {
  const productData = req.body;
  console.log("req.body ", req.body);
  const newProduct = new Product({
    ...productData,
  });

  try {
    await newProduct.save();
    console.log("Successfully added new product to DB.", newProduct);
    res.status(201).json(newProduct);
  } catch (error) {
    console.log("Error to add new product", error);
    res.status(500).json({ message: "Error creating product" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const updateData = req.body;
    
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Error updating product" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    console.log("Is secure  : ", req.protocol === "https");
    const productId = req.params.id;
    const data = await Product.findByIdAndDelete(productId);

    if (!data) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const calculateCartPrice = async (req, res) => {
  const cartItems = req.body;

  try {
    var cartItemsIds = [];

    // find all ids of cart items so we can perform find
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
      throw new Error("Product not found.");
    }
    
    // check stock availability
    for (let i = 0; i < cartItems.length; i++) {
      const product = dbProduct.find((p) => p._id == cartItems[i]._id);

      if (product && product.stocks < cartItems[i].quantity) {
        console.error(`Not enough stock for product ${product.name}`);
        return res
          .status(400)
          .json({ message: `Not enough stock for product ${product.name}` });
      } else {
        console.info("Stock availability confirmed...");
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

    var total = subTotal + 80; // Shipping charges

    console.log("calculate with db. Total with other charges :", total);

    res.status(200).json({ total, subTotal, shipping: 80 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStock = async (req, res) => {
  const { orderItems } = req.body;

  try {
    const bulkOperations = orderItems.map((item) => {
      return {
        updateOne: {
          filter: { _id: item._id },
          update: { $inc: { stocks: -item.quantity } },
        },
      };
    });

    await Product.bulkWrite(bulkOperations);
    console.log("Stock updated successfully");
    res.status(200).json({ message: "Stock updated successfully" });
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({ message: "Error updating stock" });
  }
};

export const addProductReview = async (req, res) => {
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

    if (!updatedProductWithReviews) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(updatedProductWithReviews);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong." });
  }
};
