const User = require("../models/User");
const Chat = require("../models/Chat");

const cloudinary = require("../config/cloudinary");

const uploadAvatar = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded",
      });
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "neuralchat-avatars",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        )
        .end(req.file.buffer);
    });

    const user = await User.findByIdAndUpdate(
      userId,
      {
        avatar: result.secure_url,
      },
      {
        new: true,
      },
    );

    res.json({
      avatar: user.avatar,
      user,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.avatarPublicId && user.avatarPublicId.trim() !== "") {
      await cloudinary.uploader.destroy(user.avatarPublicId);
    }

    await Chat.deleteMany({
      userId,
    });

    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: "Account deleted",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  uploadAvatar,
  deleteAccount,
};
