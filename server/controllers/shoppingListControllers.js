const ShoppingList = require("../models/ShoppingList");
const ShoppingListItem = require("../models/ShoppingListItem");

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

async function addShoppingListItem(req, res) {
  try {
    const shoppingList = await ShoppingList.findById(req.params.listId);

    if (!shoppingList) {
      return res.status(404).json({ message: "Shopping list is not found." });
    }

    if (shoppingList.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You cannot update this shopping list." });
    }

    const { name, quantity } = req.body;

    const newItem = await ShoppingListItem.create({
      name,
      quantity,
    });

    shoppingList.items.push(newItem._id);

    await shoppingList.save();
    return res.status(201).json({
      message: "Item added to shopping list.",
      item: newItem,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
}

async function updateShoppingListItem(req, res) {
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

    const item = await ShoppingListItem.findById(req.params.itemId);

    if (!item) {
      return res.status(404).json({ message: "Shopping list item not found." });
    }

    if (req.body.name !== undefined) item.name = req.body.name;
    if (req.body.quantity !== undefined) item.quantity = req.body.quantity;
    if (req.body.status !== undefined) item.status = req.body.status;

    await item.save();

    return res.status(200).json({
      message: "Shopping list item updated.",
      item,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
}

async function deleteShoppingListItem(req, res) {
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

    const itemExists = shoppingList.items.some(
      (itemId) => itemId.toString() === req.params.itemId,
    );

    if (!itemExists) {
      return res
        .status(404)
        .json({ message: "Item not found in this shopping list." });
    }

    shoppingList.items = shoppingList.items.filter(
      (itemId) => itemId.toString() !== req.params.itemId,
    );

    await shoppingList.save();

    await ShoppingListItem.findByIdAndDelete(req.params.itemId);

    return res.status(200).json({
      message: "Shopping list item deleted.",
    });
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
  addShoppingListItem,
  updateShoppingListItem,
  deleteShoppingListItem,
};
