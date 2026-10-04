const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/userControllers.js");
const verifyAuthentication = require("../middleware/verifyAuthentication.js");

router.get("/", verifyAuthentication, userControllers.getUser);
router.post("/register", userControllers.registerUser);
router.post("/login", userControllers.loginUser);

module.exports = router;