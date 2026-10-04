const express = require("express");
const router = express.Router();
const kitchenControllers = require('../controllers/kitchenControllers.js');
const verifyAuthentication = require("../middleware/verifyAuthentication.js");

router.unsubscribe(verifyAuthentication);

router.get("/kitchen-items", kitchenControllers.getAllKitchenItems);
router.post("/kitchen-items", kitchenControllers.createKitchenItem);
router.get("/kitchen-items/:itemId", kitchenControllers.getOneKitchenItem);
router.patch("/kitchen-items/:itemId", kitchenControllers.updateKitchenItem);
router.delete("/kitchen-items/:itemId", kitchenControllers.deleteKitchenItem);

module.exports = router;