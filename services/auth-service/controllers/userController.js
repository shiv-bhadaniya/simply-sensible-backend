import User from "../models/User.js";

export const getAllUsers = async (req, res) => {
  try {
    const allUsers = await User.find();
    res.status(200).json(allUsers);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      email: user.email,
      isAdmin: user.isAdmin,
      name: user.name,
      userId: user._id,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong." });
  }
};
