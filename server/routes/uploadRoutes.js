const express = require("express");
const router = express.Router();

const verifyAuthentication = require("../middleware/verifyAuthentication");
const uploadImage = require("../middleware/uploadImage");
const { uploadRecipeImage } = require("../controllers/uploadControllers");

router.use(verifyAuthentication);

router.post(
  "/recipe-image",
  (req, res, next) => {
    uploadImage.single("image")(req, res, (error) => {
      if (error) {
        return res.status(400).json({
          message: error.message,
        });
      }

      next();
    });
  },
  uploadRecipeImage,
);

module.exports = router;