const mongoose = require("mongoose");

const kitchenItemSchema = mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: [true, "Please enter an item name."],
        trim: true,
    },
    quantity: {
        type: Number,
        required: true,
        validate: { validator: (value) => Number.isFinite(value) && value > 0, message: "Quantity must be a positive finite number." },
    },
    unit: {
        type: String,
    },
    category: {
        type: String,
        enum: ['ingredient', 'leftover', 'frozen meal'],
        required: true,
    },
    expirationDate: {
        type: Date,
    },
}, {
    timestamps: true,
});

const KitchenItem = mongoose.model("KitchenItem", kitchenItemSchema);

module.exports = KitchenItem;