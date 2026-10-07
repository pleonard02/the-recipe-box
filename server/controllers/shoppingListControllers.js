const ShoppingList = require("../models/ShoppingList");

async function getAllShoppingLists(req, res) {
  try {
    const shoppingLists = await ShoppingList.find({
      owner: req.user._id,
    }).populate("items");
    return res.status(200).json({ shoppingLists });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Could not receive shopping lists." });
  }
}

async function createShoppingList(req, res) {
  try {
    const { weekOf, items } = req.body;

    const newShoppingList = await ShoppingList.create({
      owner: req.user._id,
      weekOf,
      items,
    });

    return res.status(201).json(newShoppingList);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
}

async function getOneShoppingList(req, res) {
  try {
    const shoppingList = await ShoppingList.findById(req.params.listId);

    if (!shoppingList) {
      return res
        .status(404)
        .json({ message: "We could not find the requested shopping list." });
    }

    if (shoppingList.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You cannot view this shopping list." });
    }

    return res.status(200).json(shoppingList);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
}

async function updateShoppingList(req, res) {
  try {
    const shoppingList = await ShoppingList.findById(req.params.listId);

    if (!shoppingList) {
      return res.status(404).json({ message: "Shopping list not found." });
    }

    if (shoppingList.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You cannot update this shopping list." });
    }

    if (req.body.weekOf !== undefined) shoppingList.weekOf = req.body.weekOf;
    if (req.body.items !== undefined) shoppingList.items = req.body.items;

    await shoppingList.save();
    res
      .status(200)
      .json({ message: "Shopping list updated successfully.", shoppingList });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
}

async function deleteShoppingList(req, res) {
  try {
    0;
    const shoppingList = await ShoppingList.findById(req.params.listId);

    if (!shoppingList) {
      return res.status(404).json({ message: "Shopping list not found!" });
    }

    if (shoppingList.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You cannot delete this shopping list." });
    }

    await shoppingList.deleteOne();

    return res.json({
      message: "Shopping list deleted successfully.",
      shoppingList,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
}

module.exports = {
  getAllShoppingLists,
  createShoppingList,
  getOneShoppingList,
  updateShoppingList,
  deleteShoppingList,
};
