const MealPlan = require('../models/MealPlan');

async function getAllMealPlans (req, res) {
    try {
        const mealPlan = await MealPlan.find({ owner: req.user._id });
        return res.status(200).json({mealPlan});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Could not retrieve meal plans."})
    }
}

async function createMealPlan (req, res) {
    try {
        const { weekOf, meals } = req.body;

        const newMealPlan = await MealPlan.create({
            owner: req.user._id,
            weekOf,
            meals,
        });
        
        return res.status(201).json(newMealPlan);

    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: error.message })
    }
}

async function getOneMealPlan (req, res) {
    try {
        const mealPlan = await MealPlan.findById(req.params.planId);
    
        if (!mealPlan) {
            return res.status(404).json({ message: "Meal plan not found."})
        }

        if (mealPlan.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You cannot view this meal plan."});
        }

        return res.status(200).json(mealPlan);

    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: error.message })
    }
}

async function updateMealPlan (req, res) {
    try {
        const mealPlan = await MealPlan.findById(req.params.planId);

        if (!mealPlan) {
            return res.status(404).json({ message: "Meal plan not found."})
        }

        if (mealPlan.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You cannot update this meal plan." });
        }

        if (req.body.weekOf !== undefined) mealPlan.weekOf = req.body.weekOf;
        if (req.body.meals !== undefined) mealPlan.meals = req.body.meals;
    
        await mealPlan.save();

        return res.status(200).json({ message: "Meal plan updated successfully!", mealPlan, })
    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: error.message })
    }
}

async function deleteMealPlan (req, res) {
    try {
        const mealPlan = await MealPlan.findById(req.params.planId);

        if (!mealPlan) {
            return res.status(404).json({ message: "Meal plan not found!" });
        }

        if (mealPlan.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You cannot delete this meal plan." })
        }

        await mealPlan.deleteOne();
        
        return res.json({ message: "Meal plan deleted successfully!", mealPlan});
    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: error.message });
    }
}

module.exports = {
    getAllMealPlans,
    createMealPlan,
    getOneMealPlan,
    updateMealPlan,
    deleteMealPlan,
}