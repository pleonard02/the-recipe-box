const mongoose = require("mongoose");

const shoppingListSchema = mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    weekOf: {
        type: Date,
        required: [true, "Please enter the week that you are building the shopping list for."]
    },
    items: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ShoppingListItem",
        },
    ],
}, {
    timestamps: true,
});

const ShoppingList = mongoose.model("ShoppingList", shoppingListSchema);

module.exports = ShoppingList;
