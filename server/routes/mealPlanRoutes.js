const express = require("express");
const router = express.Router();
const mealPlanControllers = require('../controllers/mealPlanControllers');
const verifyAuthentication = require('../middleware/verifyAuthentication.js');

router.use(verifyAuthentication);

router.get("/meal-plans", mealPlanControllers.getAllMealPlans);
router.post("/meal-plans", mealPlanControllers.createMealPlan);
router.get("/meal-plans/:planId", mealPlanControllers.getOneMealPlan);
router.patch("/meal-plans/:planId", mealPlanControllers.updateMealPlan);
router.delete("/meal-plans/:planId", mealPlanControllers.deleteMealPlan);

module.exports = router;
