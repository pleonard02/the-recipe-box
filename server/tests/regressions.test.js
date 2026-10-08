const { test } = require("node:test");
const assert = require("node:assert/strict");
const RecipeShare = require("../models/RecipeShare");
const { getRecipesSharedWithMe } = require("../controllers/recipeShareControllers");
const { updateRecipe } = require("../controllers/recipeControllers");
const verifyRecipeEditor = require("../middleware/verifyRecipeEditor");

function response() {
  return { code: 200, body: null, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
}

test("deleted shared recipes are excluded from results", async () => {
  const original = RecipeShare.find;
  const visible = { recipe: { _id: "recipe" } };
  RecipeShare.find = () => ({ populate: () => ({ populate: async () => [{ recipe: null }, visible] }) });
  try {
    const res = response();
    await getRecipesSharedWithMe({ user: { _id: "user" } }, res);
    assert.equal(res.code, 200);
    assert.deepEqual(res.body.sharedRecipes, [visible]);
  } finally { RecipeShare.find = original; }
});

test("unfavoriting an imported recipe saves it without changing its contents", async () => {
  let saved = false;
  const recipe = { name: "Soup", source: "mealdb", isFavorite: true, ingredients: [{ name: "salt" }], async save() { saved = true; } };
  const res = response();
  await updateRecipe({ recipe, body: { isFavorite: false } }, res);
  assert.equal(res.code, 200);
  assert.equal(saved, true);
  assert.equal(recipe.isFavorite, false);
  assert.equal(recipe.name, "Soup");
  assert.deepEqual(recipe.ingredients, [{ name: "salt" }]);
});

test("recipe edit permissions allow editors and deny viewer roles", () => {
  for (const role of ["executive-chef", "co-executive-chef", "chef", "sous-chef"]) {
    let allowed = false;
    const res = response();
    verifyRecipeEditor({ recipeRole: role }, res, () => { allowed = true; });
    assert.equal(allowed, ["executive-chef", "co-executive-chef"].includes(role));
    if (!allowed) assert.equal(res.code, 403);
  }
});
