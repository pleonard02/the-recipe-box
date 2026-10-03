const mongoose = require("mongoose");

const shoppingListItemSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter a name for the item."],
        trim: true,
    },
    quantity: {
        type: Number,
        required: [true, "Please enter an amount."],
        trim: true,
    },
    checked: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

const ShoppingListItem = mongoose.model("ShoppingListItem", shoppingListItemSchema);

module.exports = ShoppingListItem;

