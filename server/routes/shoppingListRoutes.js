const express = require("express");
const router = express.Router();
const shoppingListControllers = require("../controllers/shoppingListControllers");
const verifyAuthentication = require("../middleware/verifyAuthentication.js");

router.use(verifyAuthentication);

router.get("/shopping-lists", shoppingListControllers.getAllShoppingLists);
router.post("/shopping-lists", shoppingListControllers.createShoppingList);
router.get("/shopping-lists/:listId", shoppingListControllers.getOneShoppingList);
router.patch("/shopping-lists/:listId", shoppingListControllers.updateShoppingList);
router.delete("/shopping-lists/:listId", shoppingListControllers.deleteShoppingList);

module.exports = router;