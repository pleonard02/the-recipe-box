const express = require("express");
const router = express.Router();
const mealPlanControllers = require('../controllers/mealPlanControllers');
const verifyAuthentication = require('../middleware/verifyAuthentication.js');

router.use(verifyAuthentication);

router.get("/", mealPlanControllers.getAllMealPlans);
router.post("/", mealPlanControllers.createMealPlan);
router.get("/:planId", mealPlanControllers.getOneMealPlan);
router.patch("/:planId", mealPlanControllers.updateMealPlan);
router.delete("/:planId", mealPlanControllers.deleteMealPlan);

module.exports = router;
