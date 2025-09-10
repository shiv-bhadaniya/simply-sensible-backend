import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const isAuthenticateUser = async (req, res, next) => {
  const { token } = req.cookies;

  if (token) {
    try {
      const decodeData = jwt.verify(token, process.env.secretKey);
      req.user = await User.findById(decodeData.id);

      if (!req.user) {
        return res.status(401).json({ message: "Token not found" });
      }
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  } else {
    return res.status(401).json({ message: "Token not found" });
  }
};

export const userIsAdmin = async (req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    try {
      const decodeData = jwt.verify(token, process.env.secretKey);
      req.user = await User.findById(decodeData.id);

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      if (req.user.isAdmin) {
        next();
      } else {
        return res.status(403).json({ message: "Only for admin" });
      }
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  } else {
    return res.status(401).json({ message: "Token not found" });
  }
};
