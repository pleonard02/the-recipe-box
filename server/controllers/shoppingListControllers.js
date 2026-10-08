const ShoppingList = require("../models/ShoppingList");
const ShoppingListItem = require("../models/ShoppingListItem");
const WeeklyBuy = require("../models/WeeklyBuy");
const KitchenItem = require("../models/KitchenItem");

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
    const { weekOf } = req.body;
    const week = new Date(weekOf);
    if (Number.isNaN(week.getTime()))
      return res.status(400).json({ message: "Valid weekOf required." });
    const existing = await ShoppingList.findOne({
      owner: req.user._id,
      weekOf: week,
    });
    if (existing) return res.status(200).json(existing);
    const weeklyBuys = await WeeklyBuy.find({ owner: req.user._id });
    const seededItems = await ShoppingListItem.insertMany(
      weeklyBuys.map((buy) => ({
        name: buy.name,
        quantity: buy.quantity,
        unit: buy.unit || "",
        weeklyBuy: buy._id,
      })),
    );

    const newShoppingList = await ShoppingList.create({
      owner: req.user._id,
      weekOf,
      items: seededItems.map((item) => item._id),
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

    const { name, quantity, unit = "", makeWeeklyBuy = false } = req.body;
    const parsedQuantity = Number(quantity);
    if (
      typeof name !== "string" ||
      !name.trim() ||
      quantity === "" ||
      quantity === null ||
      quantity === undefined ||
      !Number.isFinite(parsedQuantity) ||
      parsedQuantity <= 0 ||
      typeof unit !== "string"
    ) {
      return res
        .status(400)
        .json({
          message: "Valid name and positive numeric quantity required.",
        });
    }

    if (typeof makeWeeklyBuy !== "boolean") {
      return res.status(400).json({ message: "makeWeeklyBuy must be a boolean." });
    }

    let weeklyBuy = null;
    if (makeWeeklyBuy === true) {
      weeklyBuy = await WeeklyBuy.create({
        owner: req.user._id,
        name: name.trim(),
        quantity: parsedQuantity,
        unit: unit.trim(),
      });
    }

    const newItem = await ShoppingListItem.create({
      name: name.trim(),
      quantity: parsedQuantity,
      unit: unit.trim(),
      weeklyBuy: weeklyBuy?._id || null,
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

    if (
      !item ||
      !shoppingList.items.some((id) => id.toString() === item._id.toString())
    ) {
      return res
        .status(404)
        .json({ message: "Shopping list item not found in this list." });
    }
    if (
      item.kitchenItem &&
      req.body.status &&
      req.body.status !== "purchased"
    ) {
      return res
        .status(409)
        .json({ message: "Item is already put away in My Kitchen." });
    }

    if (req.body.name !== undefined) {
      if (typeof req.body.name !== "string" || !req.body.name.trim())
        return res.status(400).json({ message: "Valid item name required." });
      item.name = req.body.name.trim();
    }
    if (req.body.quantity !== undefined) {
      const parsedQuantity = Number(req.body.quantity);
      if (
        req.body.quantity === "" ||
        req.body.quantity === null ||
        !Number.isFinite(parsedQuantity) ||
        parsedQuantity <= 0
      )
        return res
          .status(400)
          .json({ message: "Positive numeric quantity required." });
      item.quantity = parsedQuantity;
    }
    if (req.body.unit !== undefined) {
      if (typeof req.body.unit !== "string")
        return res.status(400).json({ message: "Unit must be text." });
      item.unit = req.body.unit.trim();
    }
    if (req.body.status !== undefined) item.status = req.body.status;

    await item.validate();

    if (req.body.makeWeeklyBuy !== undefined) {
      if (typeof req.body.makeWeeklyBuy !== "boolean")
        return res
          .status(400)
          .json({ message: "makeWeeklyBuy must be a boolean." });
      if (req.body.makeWeeklyBuy) {
        let existing = null;
        if (item.weeklyBuy) {
          existing = await WeeklyBuy.findOne({
            _id: item.weeklyBuy,
            owner: req.user._id,
          });
        }
        if (existing) {
          existing.name = item.name;
          existing.quantity = item.quantity;
          existing.unit = item.unit || "";
          await existing.save();
        } else {
          const buy = await WeeklyBuy.create({
            owner: req.user._id,
            name: item.name,
            quantity: item.quantity,
            unit: item.unit || "",
          });
          item.weeklyBuy = buy._id;
        }
      } else if (item.weeklyBuy) {
        await WeeklyBuy.deleteOne({ _id: item.weeklyBuy, owner: req.user._id });
        item.weeklyBuy = null;
      }
    }

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

    if (req.body.items !== undefined) {
      return res.status(400).json({ message: "Use the shopping-list item routes to add, edit, or remove items." });
    }
    if (req.body.weekOf !== undefined) {
      const week = new Date(req.body.weekOf);
      if (!req.body.weekOf || Number.isNaN(week.getTime())) {
        return res.status(400).json({ message: "A valid weekOf is required." });
      }
      shoppingList.weekOf = week;
    }

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

async function getWeeklyBuys(req, res) {
  try {
    return res.json({
      weeklyBuys: await WeeklyBuy.find({ owner: req.user._id }).sort({
        name: 1,
      }),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
async function deleteWeeklyBuy(req, res) {
  try {
    const buy = await WeeklyBuy.findOneAndDelete({
      _id: req.params.buyId,
      owner: req.user._id,
    });
    if (!buy) return res.status(404).json({ message: "Weekly Buy not found." });
    return res.json({
      message: "Recurring purchase removed; existing shopping items remain.",
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}
async function putAwayShoppingItem(req, res) {
  try {
    const list = await ShoppingList.findOne({
      _id: req.params.listId,
      owner: req.user._id,
    });
    if (!list)
      return res.status(404).json({ message: "Shopping list not found." });
    if (!list.items.some((id) => id.toString() === req.params.itemId))
      return res.status(404).json({ message: "Item not in list." });
    // Atomic claim prevents repeated clicks from creating multiple inventory items.
    const item = await ShoppingListItem.findOneAndUpdate(
      { _id: req.params.itemId, status: "purchased", kitchenItem: null },
      { $set: { kitchenItem: new (require("mongoose").Types.ObjectId)() } },
      { new: true },
    );
    if (!item)
      return res
        .status(409)
        .json({ message: "Item must be purchased and not already put away." });
    const quantity = Number(req.body.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      await ShoppingListItem.updateOne(
        { _id: req.params.itemId },
        { $set: { kitchenItem: null } },
      );
      return res
        .status(400)
        .json({ message: "Enter a positive numeric quantity." });
    }
    try {
      const kitchenItem = await KitchenItem.create({
        _id: item.kitchenItem,
        owner: req.user._id,
        name: item.name,
        quantity,
        unit: String(req.body.unit || "").trim(),
        category: "ingredient",
      });
      return res
        .status(201)
        .json({ message: "Put away in My Kitchen!", kitchenItem, item });
    } catch (error) {
      await ShoppingListItem.updateOne(
        { _id: req.params.itemId, kitchenItem: item.kitchenItem },
        { $set: { kitchenItem: null } },
      );
      throw error;
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

module.exports = {
  getWeeklyBuys,
  deleteWeeklyBuy,
  putAwayShoppingItem,
  getAllShoppingLists,
  createShoppingList,
  getOneShoppingList,
  updateShoppingList,
  deleteShoppingList,
  addShoppingListItem,
  updateShoppingListItem,
  deleteShoppingListItem,
};
