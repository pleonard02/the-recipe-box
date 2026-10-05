const express = require("express");
const router = express.Router();
const kitchenControllers = require("../controllers/kitchenControllers.js");
const verifyAuthentication = require("../middleware/verifyAuthentication.js");

router.use(verifyAuthentication);

router.get("/", kitchenControllers.getAllKitchenItems);
router.post("/", kitchenControllers.createKitchenItem);
router.get("/:itemId", kitchenControllers.getOneKitchenItem);
router.patch("/:itemId", kitchenControllers.updateKitchenItem);
router.delete("/:itemId", kitchenControllers.deleteKitchenItem);

module.exports = router;
