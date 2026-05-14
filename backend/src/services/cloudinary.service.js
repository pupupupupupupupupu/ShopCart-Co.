const cloudinary = require("../config/cloudinary");

// Optional helper for deleting images later
const deleteImageByUrl = async (imageUrl) => {
  try {
    const publicId = imageUrl
      .split("/")
      .slice(-2)
      .join("/")
      .split(".")[0];

    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Cloudinary delete error:", err.message);
  }
};

module.exports = {
  deleteImageByUrl,
};
