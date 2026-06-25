const cloudinary = require("../config/cloudinary");

const uploadImageBuffer = (buffer) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "neuralchat-images",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        },
      )
      .end(buffer);
  });

const uploadImages = async (files) =>
  Promise.all(files.map((file) => uploadImageBuffer(file.buffer)));

module.exports = {
  uploadImages,
};
