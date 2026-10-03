const mongoose = require("mongoose");

const mealPlanSchema = mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    weekOf: {
        type: Date,
        required: true,
    }, 
    meals: [
        {
            day: {
                    type: String,
                    required: true,
            },
            mealType: {
                type: String,
                enum: ['breakfast', 'lunch', 'dinner', 'snack'],
            },
            recipe: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Recipe',
            },
        },
    ],
});

const MealPlan = mongoose.model("MealPlan", mealPlanSchema);

module.exports = MealPlan;