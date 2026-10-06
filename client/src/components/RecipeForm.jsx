import { useState } from "react";

function createIngredient() {
  return { name: "", quantity: "", unit: "" };
}

const emptyRecipe = {
  name: "",
  description: "",
  ingredients: [createIngredient()],
  instructions: "",
  prepTime: "",
  cookTime: "",
  servings: "",
  isPublic: false,
};

function RecipeForm({ onClose, token, onRecipeCreated, editingRecipe }) {
  const [recipe, setRecipe] = useState(editingRecipe || emptyRecipe);
  const [formError, setFormError] = useState("");

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setRecipe((currentRecipe) => ({
      ...currentRecipe,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleIngredientChange(index, field, value) {
    setRecipe((currentRecipe) => {
      const updatedIngredients = [...currentRecipe.ingredients];

      updatedIngredients[index] = {
        ...updatedIngredients[index],
        [field]: value,
      };

      return {
        ...currentRecipe,
        ingredients: updatedIngredients,
      };
    });
  }

  function handleAddIngredient() {
    setRecipe((currentRecipe) => ({
      ...currentRecipe,
      ingredients: [...currentRecipe.ingredients, createIngredient()],
    }));
  }

  function handleRemoveIngredient(indexToRemove) {
    setRecipe((currentRecipe) => {
      if (currentRecipe.ingredients.length === 1) {
        return {
          ...currentRecipe,
          ingredients: [createIngredient()],
        };
      }

      return {
        ...currentRecipe,
        ingredients: currentRecipe.ingredients.filter(
          (_, index) => index !== indexToRemove,
        ),
      };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    const hasValidIngredient = recipe.ingredients.some(
      (ingredient) =>
        ingredient.name.trim() || ingredient.quantity || ingredient.unit,
    );

    if (
      !recipe.name.trim() ||
      !recipe.instructions.trim() ||
      !hasValidIngredient
    ) {
      setFormError(
        "Please enter a recipe name, at least one ingredient, and instructions before saving.",
      );
      return;
    }

    const recipeData = {
      ...recipe,
      prepTime: Number(recipe.prepTime),
      cookTime: Number(recipe.cookTime),
      servings: Number(recipe.servings),
      ingredients: recipe.ingredients.map((ingredient) => ({
        ...ingredient,
        quantity: Number(ingredient.quantity),
      })),
    };

    const url = editingRecipe
      ? `http://localhost:3000/api/recipe/${editingRecipe._id}`
      : "http://localhost:3000/api/recipe";

    const method = editingRecipe ? "PATCH" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(recipeData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not create recipe.");
      }

      console.log("Recipe created:", data);
      setRecipe(emptyRecipe);
      onRecipeCreated?.();
      onClose();
    } catch (error) {
      console.error("Create recipe error:", error);
      setFormError(error.message || "Could not create recipe.");
    }
  }

  return (
    <section className="mx-auto max-w-3xl rounded-[28px] border border-[#dbe3e6] bg-[#fffdf7] px-6 py-8 shadow-[0_20px_60px_rgba(13,86,134,0.08)] sm:px-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#1677b8]">
            THE RECIPE BOX
          </p>
          <h2 className="text-3xl font-semibold text-[#0d5686]">
            Add a Recipe
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-[#dbe3e6] bg-white px-4 py-2 text-sm font-medium text-[#0d5686] transition hover:border-[#1677b8] hover:text-[#1677b8]"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="space-y-2">
          <label
            className="block text-sm font-semibold text-[#0d5686]"
            htmlFor="name"
          >
            Recipe Name
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={recipe.name}
            onChange={handleChange}
            placeholder="e.g. Lemon Herb Pasta"
            className="mt-1 w-full rounded-xl border border-[#dbe3e6] bg-[#fcfcfa] px-4 py-3 text-base text-[#253238] placeholder-[#7c858b] transition focus:border-[#1677b8] focus:outline-none focus:ring-4 focus:ring-[#1677b8]/10"
            required
          />
        </div>

        <div className="space-y-2">
          <label
            className="block text-sm font-semibold text-[#0d5686]"
            htmlFor="description"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={recipe.description}
            onChange={handleChange}
            rows={3}
            placeholder="Tell people what makes this recipe special..."
            className="mt-1 w-full rounded-xl border border-[#dbe3e6] bg-[#fcfcfa] px-4 py-3 text-base text-[#253238] placeholder-[#7c858b] transition focus:border-[#1677b8] focus:outline-none focus:ring-4 focus:ring-[#1677b8]/10"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <label
              className="block text-sm font-semibold text-[#0d5686]"
              htmlFor="prepTime"
            >
              Prep Time
            </label>
            <input
              id="prepTime"
              type="number"
              name="prepTime"
              value={recipe.prepTime}
              onChange={handleChange}
              min="0"
              className="mt-1 w-full rounded-xl border border-[#dbe3e6] bg-[#fcfcfa] px-4 py-3 text-base text-[#253238] transition focus:border-[#1677b8] focus:outline-none focus:ring-4 focus:ring-[#1677b8]/10"
            />
          </div>

          <div className="space-y-2">
            <label
              className="block text-sm font-semibold text-[#0d5686]"
              htmlFor="cookTime"
            >
              Cook Time
            </label>
            <input
              id="cookTime"
              type="number"
              name="cookTime"
              value={recipe.cookTime}
              onChange={handleChange}
              min="0"
              className="mt-1 w-full rounded-xl border border-[#dbe3e6] bg-[#fcfcfa] px-4 py-3 text-base text-[#253238] transition focus:border-[#1677b8] focus:outline-none focus:ring-4 focus:ring-[#1677b8]/10"
            />
          </div>

          <div className="space-y-2">
            <label
              className="block text-sm font-semibold text-[#0d5686]"
              htmlFor="servings"
            >
              Servings
            </label>
            <input
              id="servings"
              type="number"
              name="servings"
              value={recipe.servings}
              onChange={handleChange}
              min="1"
              className="mt-1 w-full rounded-xl border border-[#dbe3e6] bg-[#fcfcfa] px-4 py-3 text-base text-[#253238] transition focus:border-[#1677b8] focus:outline-none focus:ring-4 focus:ring-[#1677b8]/10"
            />
          </div>
        </div>

        <fieldset className="space-y-3 rounded-2xl border border-[#dbe3e6] bg-white p-4">
          <div className="flex items-center justify-between gap-4">
            <legend className="text-sm font-semibold text-[#0d5686]">
              Ingredients
            </legend>
            <button
              type="button"
              onClick={handleAddIngredient}
              className="rounded-full bg-[#f6d447] px-3 py-1.5 text-sm font-semibold text-[#0d5686] transition hover:bg-[#fff3a6]"
            >
              + Add ingredient
            </button>
          </div>

          {recipe.ingredients.map((ingredient, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-xl border border-[#edf2f4] bg-[#fffdf7] p-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
            >
              <input
                type="text"
                placeholder="Ingredient"
                value={ingredient.name}
                onChange={(event) =>
                  handleIngredientChange(index, "name", event.target.value)
                }
                className="w-full rounded-xl border border-[#dbe3e6] bg-[#fcfcfa] px-3 py-2.5 text-base text-[#253238] placeholder-[#7c858b] transition focus:border-[#1677b8] focus:outline-none focus:ring-4 focus:ring-[#1677b8]/10"
              />

              <input
                type="number"
                placeholder="Qty"
                value={ingredient.quantity}
                onChange={(event) =>
                  handleIngredientChange(index, "quantity", event.target.value)
                }
                min="0"
                className="w-full rounded-xl border border-[#dbe3e6] bg-[#fcfcfa] px-3 py-2.5 text-base text-[#253238] placeholder-[#7c858b] transition focus:border-[#1677b8] focus:outline-none focus:ring-4 focus:ring-[#1677b8]/10"
              />

              <input
                type="text"
                placeholder="Unit"
                value={ingredient.unit}
                onChange={(event) =>
                  handleIngredientChange(index, "unit", event.target.value)
                }
                className="w-full rounded-xl border border-[#dbe3e6] bg-[#fcfcfa] px-3 py-2.5 text-base text-[#253238] placeholder-[#7c858b] transition focus:border-[#1677b8] focus:outline-none focus:ring-4 focus:ring-[#1677b8]/10"
              />

              <button
                type="button"
                onClick={() => handleRemoveIngredient(index)}
                className="rounded-xl border border-[#dbe3e6] px-3 py-2 text-sm font-medium text-[#0d5686] transition hover:border-[#1677b8] hover:text-[#1677b8]"
              >
                Remove
              </button>
            </div>
          ))}
        </fieldset>

        <div className="space-y-2">
          <label
            className="block text-sm font-semibold text-[#0d5686]"
            htmlFor="instructions"
          >
            Instructions
          </label>
          <textarea
            id="instructions"
            name="instructions"
            value={recipe.instructions}
            onChange={handleChange}
            rows={5}
            placeholder="Write the steps for making this recipe..."
            className="mt-1 w-full rounded-xl border border-[#dbe3e6] bg-[#fcfcfa] px-4 py-3 text-base text-[#253238] placeholder-[#7c858b] transition focus:border-[#1677b8] focus:outline-none focus:ring-4 focus:ring-[#1677b8]/10"
          />
        </div>

        <label className="flex items-center gap-3 text-sm font-semibold text-[#0d5686]">
          <input
            type="checkbox"
            name="isPublic"
            checked={recipe.isPublic}
            onChange={handleChange}
            className="h-4 w-4 rounded border-[#dbe3e6] text-[#1677b8] focus:ring-[#1677b8]"
          />
          Make this recipe public
        </label>

        {formError && (
          <p
            role="alert"
            className="rounded-xl bg-[#fff0ed] px-4 py-3 text-sm font-medium text-[#9b2424]"
          >
            {formError}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#dbe3e6] bg-white px-5 py-3 text-sm font-semibold text-[#0d5686] transition hover:border-[#1677b8] hover:text-[#1677b8]"
          >
            Close
          </button>

          <button
            type="submit"
            className="rounded-xl border border-[#0d5686] bg-[#0d5686] px-5 py-3 text-sm font-semibold text-[#fff3a6] shadow-[0_10px_20px_rgba(13,86,134,0.2)] transition hover:bg-[#1677b8]"
          >
            Save Recipe
          </button>
        </div>
      </form>
    </section>
  );
}

export default RecipeForm;
