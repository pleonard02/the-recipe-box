const express = require("express");
const router = express.Router();
const shoppingListControllers = require("../controllers/shoppingListControllers");
const verifyAuthentication = require("../middleware/verifyAuthentication.js");

router.use(verifyAuthentication);

router.get("/", shoppingListControllers.getAllShoppingLists);
router.post("/", shoppingListControllers.createShoppingList);
router.get("/:listId", shoppingListControllers.getOneShoppingList);
router.patch("/:listId", shoppingListControllers.updateShoppingList);
router.delete("/:listId", shoppingListControllers.deleteShoppingList);

module.exports = router;