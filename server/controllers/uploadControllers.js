const cloudinary = require("../config/cloudinary");

async function uploadRecipeImage(req, res) {
  if (!req.file) {
    return res.status(400).json({
      message: "Please select an image.",
    });
  }

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "the-recipe-box/recipes",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      );

      stream.end(req.file.buffer);
    });

    return res.status(200).json({
      image: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);

    return res.status(500).json({ message: "Could not upload recipe image." });
  }
}

module.exports = { uploadRecipeImage };