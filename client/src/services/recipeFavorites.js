import { API_URL } from "../config/api";

export async function updateRecipeFavorite(recipe, token) {
  const removeImportedRecipe = !recipe.isShared && recipe.source === "mealdb" && recipe.isFavorite;
  const response = await fetch(`${API_URL}/api/recipe/${recipe._id}${removeImportedRecipe ? "" : "/favorite"}`, {
    method: removeImportedRecipe ? "DELETE" : "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    ...(removeImportedRecipe ? {} : {
      body: JSON.stringify({ isFavorite: !recipe.isFavorite }),
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Could not update favorite.");
  return removeImportedRecipe ? null : data.recipe;
}
