const KitchenItem = require('../models/KitchenItem');

async function getAllKitchenItems (req, res) {
    try {
        const kitchenItems = await KitchenItem.find({ owner: req.user._id });
        return res.status(200).json({kitchenItems})
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Could not receive kitchen items." });
    }
}

async function createKitchenItem (req, res) {
    try {
        const { name, quantity, unit, category, expirationDate } = req.body;

        const newKitchenItem = await KitchenItem.create({
            owner: req.user._id,
            name,
            quantity, 
            unit, 
            category, 
            expirationDate,
        });

        return res.status(201).json(newKitchenItem);

    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: error.message });
    }
}

async function getOneKitchenItem (req, res) {
    try {
        const kitchenItem = await KitchenItem.findById(req.params.itemId);

        if (!kitchenItem) {
            return res.status(404).json({ message: "Kitchen item not found." })
        }

        if (kitchenItem.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You cannot view this shopping list." });
        }

        return res.status(200).json(kitchenItem);

    } catch (error) {
        console.error(error);
        return res.status(403).json({ message: error.message })
    }
}

async function updateKitchenItem (req, res) {
    try {
        const kitchenItem = await KitchenItem.findById(req.params.itemId);

        if (!kitchenItem) {
            return res.status(400).json({ message: "This pantry was unable to be located." });
        }

        if (kitchenItem.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You can't update this kitchen."})
        }

        if (req.body.name !== undefined) kitchenItem.name = req.body.name;
        if (req.body.quantity !== undefined) kitchenItem.quantity = req.body.quantity;
        if (req.body.unit !== undefined) kitchenItem.unit = req.body.unit;
        if (req.body.category !== undefined) kitchenItem.category = req.body.category;
        if (req.body.expirationDate !== undefined) kitchenItem.expirationDate = req.body.expirationDate;

        await kitchenItem.save();
        
        return res.status(200).json({ message: "Kitchen item updated successfully.", kitchenItem, });

    } catch (error) {
        console.error(error);
        return res.status(404).json({ message: error.message })
    }
}

async function deleteKitchenItem (req, res) {
    try {
        const kitchenItem = await KitchenItem.findById(req.params.itemId);

        if (!kitchenItem) {
            return res.status(404).json({ message: "Kitchen item could not be found!"});
        }

        if (kitchenItem.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You cannot delete this kitchen item."});
        }

        await kitchenItem.deleteOne();
        return res.json({ message: "Kitchen item was deleted successfully!", kitchenItem });

    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: error.message })
    }
}

module.exports = {
    getAllKitchenItems,
    createKitchenItem,
    getOneKitchenItem,
    updateKitchenItem,
    deleteKitchenItem,
}